const express =  require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');  // file system

const{Op, Sequelize} = require('sequelize');
const { Animal, User , Category, sequelize  } = require('../models');
const { isLoggedIn } = require('./middlewares');
const category = require('../models/category');
const animal = require('../models/animal');
const user = require('../models/user');

module.exports = router;

//폴더
try {
  fs.accessSync('animalProfile');
}catch(error){
  console.log('animalProfile 폴더가 없으면 생성합니다');
  fs.mkdirSync('animalProfile');
}

//1. 업로드 설정
const upload = multer({
  storage: multer.diskStorage({ 
    destination(req, file, done) {  // 지정경로
      done(null,  'animalProfile');  //지정경로 지정 - 콜백  
    },
    filename(req, file, done) {  // 업로드된 파일이름 지정
      const ext      = path.extname(file.originalname);       
      const basename = 'ani_' + Date.now() + ext;
      done(null, basename);
    },
  }),
  limits : { fileSize: 20*1024*1024 }   // 10MB
});

//1. 프로필 생성
router.post('/animalform', isLoggedIn, upload.single('aniProfile'), async (req, res, next) => {
  try{
    const animal = await Animal.create({
      aniName: req.body.aniName,
      aniAge: req.body.aniAge,
      aniProfile: req.file ? req.file.filename : null,
      UserId: req.user.id,
      CategoryId: req.body.categoryId,
    });
    res.status(201).json(animal);
  } catch(error){
    console.error(error);
    res.status(500).json({ message: '서버 에러 발생', error });
    next(error);
  }
});

router.get('/my', isLoggedIn, async (req, res, next) => {
  try {
    console.log('✅ user id:', req.user?.id);
    const myAnimals = await Animal.findAll({
      where: {UserId: req.user.id},
      order: [['createdAt', 'desc']],
    });
    if (!myAnimals || myAnimals.length === 0) {
      return res.status(404).json({ error: '동물 프로필을 찾을 수 없습니다.' });
    }
    res.status(200).json(myAnimals);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: '잘못된 사용자 ID입니다.' });
    }

    const animals = await Animal.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'desc']],
    });

    res.status(200).json(animals);
  } catch (error) {
    console.error('❌ 사용자 동물 목록 조회 실패:', error);
    next(error);
  }
});

//2. 해당유저 동물 프로필 리스트
// 동물 프로필 상세 보기 및 같은 유저의 모든 동물 목록 가져오기
router.get('/:animalId', async (req, res, next) => {
  try {
    // 해당 동물 프로필 가져오기 (User 포함)
    const animal = await Animal.findOne({
      where: { id: req.params.animalId },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        {
          model: Animal,
          as: 'Followings',
          attributes: ['id'],
        },
        {
          model: Animal,
          as: 'Followers',
          attributes: ['id'],
        },
        {
          model: Category,
          attributes: ['content', 'id'],
        },
      ],
    });

    if (!animal) {
      return res.status(404).json({ error: '동물 프로필을 찾을 수 없습니다.' });
    }

    // 같은 UserId로 등록된 모든 동물 리스트 가져오기
    const userAnimals = await Animal.findAll({
      where: { UserId: animal.UserId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ animal, userAnimals });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


//3. 프로필 삭제
router.delete('/:animalId', isLoggedIn, async (req, res, next) => {
  try { 
      const deleted = await Animal.destroy({   
        where: {
          id: req.params.animalId,    // 삭제하려는 프로필id
          UserId : req.user.id   // 프로필소유한 유저
        }
      }); 
      
       if (deleted === 0) {
         return res.status(403).json({ message: '권한이 없습니다.' });
       }
      
      res.status(200).json({ animalId: parseInt(req.params.animalId, 10), deleted });
    } catch (error) { 
      console.error(error);
      next(error);
    }
});

//4. 프로필 수정
router.patch('/:animalId', isLoggedIn, upload.single('aniProfile'), async (req, res, next) => {
  try {
    const updateData = {
        aniName: req.body.aniName,
        aniAge: req.body.aniAge,
        CategoryId: req.body.categoryId,
    };
    // 파일이 첨부된 경우에만 aniProfile 업데이트
    if (req.file) {
      updateData.aniProfile = req.file.filename;
    }

    const [updatedCount] = await Animal.update(updateData, {
      where: {
        id: req.params.animalId,
        UserId: req.user.id,
      },
    });
    if (updatedCount === 0) {
      return res.status(403).json({ message: '수정 권한이 없거나 존재하지 않는 프로필입니다.' });
    }
    res.status(200).json({
      message: '수정 완료',
      animal: {
        id: req.params.animalId,
        aniName: updateData.aniName,
        aniAge: updateData.aniAge,
        CategoryId: updateData.CategoryId,
        aniProfile: req.file?.filename, // 없으면 undefined
      },
    });
  }catch(error){
    console.log(error);
    next(error);
  }
})


//5. 팔로우
router.patch('/:animalId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const targetAnimal = await Animal.findByPk(req.params.animalId); // 팔로우 당하는 쪽
    const followerAnimal = await Animal.findByPk(Number(req.body.myAnimalId)); // 팔로우 하는 쪽

    if (!targetAnimal || !followerAnimal) {
      return res.status(404).send('해당 동물 프로필을 찾을 수 없습니다.');
    }

    await targetAnimal.addFollower(followerAnimal); // target의 팔로워로 follower를 추가
    res.status(200).json({ followedId: targetAnimal.id, followerId: followerAnimal.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
//6. 언팔로우
router.delete('/:animalId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const targetAnimal = await Animal.findByPk(req.params.animalId);
    const followerAnimal = await Animal.findByPk(Number(req.body.myAnimalId)); 

    if (!targetAnimal || !followerAnimal) {
      return res.status(404).send('해당 동물 프로필을 찾을 수 없습니다.');
    }

    await targetAnimal.removeFollower(followerAnimal);
    res.status(200).json({ unfollowedId: targetAnimal.id, followerId: followerAnimal.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 친구(팔로워) 삭제
router.delete('/:animalId/follower', isLoggedIn, async (req, res, next) => {
  const { animalId } = req.params;      // 나
  const { targetAnimalId } = req.body;  // 삭제할 팔로워
  await removeFollowerRelation(animalId, targetAnimalId);
  res.status(200).json({ removedFollowerId: targetAnimalId });
});

async function removeFollowerRelation(animalId, targetAnimalId) {
  const target = await Animal.findByPk(animalId);
  const follower = await Animal.findByPk(targetAnimalId);
  if (!target || !follower) throw new Error('Profile not found');
  await target.removeFollower(follower);
}

//7. 팔로워 리스트
router.get('/:animalId/followers', async (req, res, next) => {
  try {
    const animal = await Animal.findByPk(req.params.animalId);
    const followers = await animal.getFollowers({
      include: [
        {model: Category, attributes: ['content','id'],},
        {model: Animal, as: 'Followings', attributes: ['id'],},
      ]
    });
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//8. 팔로잉 리스트
router.get('/:animalId/followings', async (req, res, next) => {
  try {
    const animal = await Animal.findByPk(req.params.animalId);
    const followings = await animal.getFollowings({
      include: [
        {model: Category, attributes: ['content','id'],},
        {model: Animal, as: 'Followers', attributes: ['id'],},
      ]
    });
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 9. 추천 친구 리스트
router.get('/:animalId/recommendations', async (req, res, next) => {
  try {
    const currentAnimal = await Animal.findByPk(req.params.animalId, {
      include: [{ model: Animal, as: 'Followings' },],
    });

    if (!currentAnimal) {
      return res.status(404).json({ message: '동물을 찾을 수 없습니다.' });
    }

    const followingIds = currentAnimal.Followings.map(a => a.id);

    const recommendedAnimals = await Animal.findAll({
      where: {
        id: {
          [Op.notIn]: [...followingIds, parseInt(req.params.animalId, 10)], // 이미 팔로우한 동물 + 자기자신 제외
        },
      },
      limit: 5,
      order: [ [Sequelize.literal('RAND()')] ], // 랜덤 추천
      attributes: ['id', 'aniName', 'aniProfile'],
      include: [
        { model: Category, attributes: ['content','id'] }
      ], 
    });

    res.status(200).json(recommendedAnimals);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  const { name = '', categoryId } = req.query;
  const where = {
    ...(name && { aniName: { [Op.like]: `%${name}%` } }),
    ...(categoryId && { CategoryId: Number(categoryId) }),
  };
  try {
    const animals = await Animal.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'content'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(animals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '검색 실패', error });
    next(error);
  }
});
// //9. 동물 프로필 상세 보기
// router.get('/:animalId', async (req, res, next) => {
//   try {
//     const animal = await Animal.findOne({
//       where: { id: req.params.animalId },
//       include: [
//         //{ model: Category, attributes: ['id', 'name'] }, // 카테고리 정보도 함께
//         //{ model: User, attributes: ['id', 'nickname'] }, // 유저 정보
//       ],
//     });
//     if (!animal) {
//       return res.status(404).json({ error: '동물 프로필을 찾을 수 없습니다.' });
//     }

//     res.status(200).json(animal);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

module.exports = router;