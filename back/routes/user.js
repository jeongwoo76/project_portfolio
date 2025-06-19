const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passport = require('passport');
const nodemailer = require('nodemailer');
const { User, Post, Blacklist, UserProfileImage } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Transaction } = require('sequelize');
const multer = require('multer');  // 파일업로드
const path = require('path');  // 경로
const fs = require('fs');  // file system
const { sequelize } = require('../models');
//const {smtpTransport} = require('../config/email');

// create :  객체.create({})
// select :  객체.findAll , 객체.findOne
// update :  객체.update
// delete :  객체.destroy()

try {
  fs.accessSync('userImages');  // 폴더 존재여부 확인
} catch (error) {
  console.log('uploads 폴더가 없으면 생성합니다. ');
  fs.mkdirSync('userImages'); // 폴더만들기
}
/////////////////////////////////////////////////
//1. 업로드 설정
const upload = multer({
  storage: multer.diskStorage({ // 저장소설정 - 업로드된 파일의 저장위치,파일이름 지정하는 역할
    //파일을 디스크 (로컬 파일시스템)에 저장하도록 설정
    destination(req, file, done) {  // 지정경로
      done(null, 'userImages');  //지정경로 지정 - 콜백  
      //  null 에러없음,   uploads  저장될 폴더경로
    },
    filename(req, file, done) {  // 업로드된 파일이름 지정
      // images1.png
      const ext = path.extname(file.originalname);       //1. 확장자 추출  .png
      const basename = path.basename(file.originalname, ext); //2. 이미지이름   images1
      done(null, basename + '_' + new Date().getTime() + ext);//3. images1_날짜지정.png
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }   // 10MB
});

// 1. 회원가입
// post :  localhost:3065/user/
// 설정1 :  Header   Content-Type : application/json
// 설정2 :  Body     -[Raw]   -[JSON]
// {  "email": "test@test.com",  "nickname": "test",  "password": "test" }
router.post('/', isNotLoggedIn, async (req, res, next) => {   //res.send('..... join');
  try {
    console.log('req.body=', req.body);
    //1. 이메일중복확인  sql - select :  객체.findOne
    // const user = await User.findOne({ where: { email: req.body?.email, } });
    //2. 결과확인 - 존재하면 이미사용중인 아이디입니다.
    //if (user) { return res.status(403).send('이미사용중인 아이디입니다.'); }
    //3. 비밀번호 암호화
    const hashPassword = await bcrypt.hash(req.body.password, 12);  // 암호화강도 10~13
    //4. 사용자 생성  객체.create - insert
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashPassword,
      phonenumber: req.body.phoneNum,
    });
    const image = await UserProfileImage.create({
      src: ''
    })
    await user?.addUserProfileImage(image);
    //5. 응답 - 회원가입 성공 ok
    res.status(201).send('회원가입완료!');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//2. 로그인
// localhost:3065/user/login
router.post('/login', isNotLoggedIn, async (req, res, next) => {
  console.log('email=',req.body.email)
  const user = await User.findOne({where:{email:req.body.email}}) 
  console.log('user정보=',user.username);
  const isMatch = await bcrypt.compare(req.body.password,user.password)
  if(!user||!isMatch){
    console.log("없는 유저 실행");
    return res.status(401).json({isLogin:false, message:"아이디와 비밀번호를 확인해주세요!"})
  }
  passport.authenticate('local', (err, user, info) => {
    //1. err 오류처리
    if (err) { console.error(err); return next(err); }

    //2. 인증정보있다면 -  세션 401상태코드 ( 인증필요 )
    if (info) { return res.status(401).send(info.reason); }

    //3. 사용자세션에 등록
    return req.login(user, async (loginErr) => {
      // 3-1. 로그인시 에러발생
      if (loginErr) { console.error(loginErr); return next(loginErr); }

      // 3-2. 사용자정보조회  ( sql - join )
      const fullUser = await User.findOne({  // sql : select 
        where: { id: user.id },    // 아이디를 이용해서 정보조회
        attributes: { exclude: ['password'] },   // password 제외하고 조회
        include: [{ model: Post, attributes: ['id'] }
          , { model: User, as: 'Followings', attributes: ['id'] }  // 사용자가 팔로우한    다른user id
          , { model: User, as: 'Followers', attributes: ['id'] }  // 사용자를 팔로우하는   다른user id
          , { model: UserProfileImage, attributes: ['id'] }
        ],
      });
      return res.status(200).json(fullUser);
    });
  })(req, res, next);   // passport.authenticate() 의 반환값을 즉시실행
});


//3.  로그인한 경우 사용자의 정보가져오기
// GET :  localhost:3065/user
// 설정1 :  Header   Cookie : connect.sid=Cookie  값으로 설정된값
// 로그인후에 Cookie에 id값 
/*  3-1.  router.get 이용해서  -  사용자정보페이지  출력  #
    3-2.  1) 로그인사용자확인  ,로그인한유저 정보반환         */
router.get('/', async (req, res, next) => {
  // res.send('사용자정보조회');
  console.log('사용자정보조회', req.user.id);
  console.log('프로필확인', req.user.userId);
  try {
    //1) 로그인사용자확인
    //2) 로그인한유저 정보반환
    if (req.user) {
      const fullUser = await User.findOne({
        where: { id: req.user.id }, // 조건 :  id로 검색
        attributes: { exclude: ['password'] },// 비밀번호 빼고 결과가져오기
        include: [
          { model: Post, attributes: ['id'] }
          , { model: User, as: 'Followings', attributes: ['id'] }
          , { model: User, as: 'Followers', attributes: ['id'] }
          , { model: User, as: 'Blocking', attributes: ['id'] }
          , { model: User, as: 'Blocked', attributes: ['id'] }
          , { model: UserProfileImage }
        ]// Post, Followers , Followings
      });
      res.status(200).json(fullUser);
    } else {
      res.status(200).json(null);   //로그인안되면 null 반환
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/profileUpdate', isLoggedIn , upload.array('profileImage'), async (req, res, next) => {
  const t = await sequelize.transaction();
  //res.send('닉네임변경');
  // update users   set  nickname=?  where  id=? 
  console.log('닉네임변경=',req.body.nickname);
   console.log('사진변경=',req.body.profileImage);
  //console.log('사진변경=',req.files);
  //console.log('사진변경=',req.files[0].originalname,);
  
  try {
    await User.update({
      nickname: req.body.nickname,
    }, {
      where: { id: req.user.id },transaction:t
    });
    await UserProfileImage.update({
      src: req.body.profileImage,
    }, {
      where: { userId: req.user.id },transaction:t
    })
    await t.commit();
    res.status(201).json({ success: true });
  } catch (error) {
    await t.commit();
    console.error(error);
    next(error);
  }
});
router.post('/images', isLoggedIn, upload.array('profileImage'), (req, res, next) => { 
  console.log('profileImage',req.files);
  res.json(  req.files.map(  (v)=> v.filename  ));
});

router.get('/postUser', async (req, res, next) => {
  // res.send('사용자정보조회');
  console.log('사용자정보조회', req.user.id);
  console.log('postUser프로필확인', req.query.userId);
  try {
    // 상대방 아이디
    const targetUserId = req.query.userId;
    // 내 아이디
    const meId = req.user?.id;
    // 차단한 유저 확인
    const isBlocked = await Blacklist.findOne({
      where: { BlockingId: targetUserId, BlockedId: meId },
    });

    //1) 로그인사용자확인
    //2) 로그인한유저 정보반환
    if (req.user) {
      const fullUser = await User.findOne({
        where: { id: req.query.userId }, // 조건 :  id로 검색
        attributes: { exclude: ['password'] },// 비밀번호 빼고 결과가져오기
        include: [
          { model: Post, attributes: ['id'] }
          , { model: User, as: 'Followings', attributes: ['id'] }
          , { model: User, as: 'Followers', attributes: ['id'] }
          , { model: User, as: 'Blocking', attributes: ['id'] } // ✅ 이게 차단한 유저
          , { model: User, as: 'Blocked', attributes: ['id'] }  // 이건 나를 차단한 유저
        ]// Post, Followers , Followings
      });
      res.status(200).json({
        ...fullUser?.toJSON(),
        isBlockedMe: !!isBlocked,
      });
    } else {
      res.status(200).json(null);   //로그인안되면 null 반환
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//4. 로그아웃
// POST : localhost:3065/user/logout    로그아웃기능입니다 출력
router.post('/logout', isLoggedIn, (req, res, next) => {  // 사용자가 로그인상태면  로그아웃이 실행되도록
  try {
    req.logout(function (err) {
      if (err) { return next(err); }

      req.session.destroy((err) => {   ///  
        if (err) {
          return next(err);
        }
        res.send('ok'); // 로그아웃 성공 응답
      });
    });

  } catch (err) {

  }
});
//회원탈퇴
router.delete('/userDelete', isLoggedIn, async (req, res, next) => {
  console.log('탈퇴유저:', req.user.id);
  try {
    // await User.update({
    //   isDeleted: true,
    //   deleteAt: new Date(),
    //   updatedAt: new Date(),
    // }, {
    //   where : { id : req.user.id }
    // });

    await User.destroy({
      where: { id: req.user.id },
      // include:[{
      //     model:Post,
      //     attributes:['id']
      // }]
    })
    await Post.destroy({
      where: { userId: req.user.id }
    })
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err)
        }
        return res.send('ok');
      })
    })
  } catch (err) {
    console.error(err);
    next(err);
  }
});
//5. 닉네임변경
// POST : localhost:3065/user/nickname  닉네임변경 출력
// 1. 로그인
// 2. Header 쿠키설정
// 3. Body  - [Raw] - [Json]  {  "nickname":"4444" }
router.post('/nickname', isLoggedIn , upload.array('nickname'), async (req, res, next) => {
  //res.send('닉네임변경');
  // update users   set  nickname=?  where  id=? 
  console.log('닉네임변경=',req.body.nickname);
  try {
    await User.update({
      nickname: req.body.nickname,
    }, {
      where: { id: req.user.id }
    });
    res.status(200).json({});
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/changePass', isLoggedIn , async (req, res, next) => {
  //res.send('닉네임변경');
  // update users   set  nickname=?  where  id=?
  //현재비밀번호와 다른 비밀번호를 입력해주세요.
  const user = await User.findOne({
    where: {id : req.user.id}
  })
  const isMatch = await bcrypt.compare(req.body.changePass, user.password)
  if(isMatch){
    console.log('현재비밀번호와 다른 비밀번호를 입력해주세요.');
    return res.status(401).json({success: false, message: '현재비밀번호와 다른 비밀번호를 입력해주세요.'})
  }
  console.log('비밀번호변경=',req.body.changePass);
  const hashPassword = await bcrypt.hash(req.body.changePass, 12);
  try { 
    const result = await User.update({
      password: hashPassword,
    }, {
      where: { id: req.user.id }
    });
    res.status(200).json({success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false});
    next(error);
  }
});
router.post('/userDelete', isLoggedIn, async (req, res, next) => {
  const user = await User.findOne({where: {id : req.user.id}})
  console.log('req.body.changePass=',req.body.confirmPass);
  const isMatch = await bcrypt.compare(req.body.confirmPass,user.password);
  if(!isMatch){
    console.log('비밀번호다름!');
    return res.status(401).json({message:'비밀번호를 확인해주세요!'})
  }
  try{
    await User.destroy({ where: { id: req.user.id } });
     req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err)
        }
        return res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
      })
    })
  }catch(error){
    console.log(error)
    next(error)
  }
})
/////////////////////////////////////
//6. 팔로우
// PATCH : localhost:3065/users/:userId/follow  팔로우기능추가
//         localhost:3065/users/2/follow      ( 친구번호 )
//1. 위의 경로로 router 작성
//2. 넘겨받은 아이디로 유저인지 select 구문확인 /   User.findOne
//3. 유저에 추가  user.addFollowers
//4. 상태표시
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  console.log('유저아이디=', req.params.userId);
  console.log('내 아이디=', req.user.id);
  console.log('팔로우 등록');
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) }); //10진수
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//7. 팔로잉찾기 ( 내가 찾아보는 친구들 )
// GET : localhost:3065/users/followings
//1. 위의 경로로 router 작성
//2. 넘겨받은 아이디로 유저찾기
//3. 해당유저의 팔로잉찾기  user.getFollowings()
router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//8. 팔로우찾기
// GET : localhost:3065/users/followers
//1. 위의 경로로 router 작성
//2. 넘겨받은 아이디로 유저찾기
//3. 해당유저의 팔로워찾기  user.getFollowers()
router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    const followers = await user.getFollowers();  //##
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



//9. 언팔로우 
// DELETE : localhost:3065/users/:userId/follow
//          localhost:3065/users/2/follow      ( 친구번호 )
//1. 위의 경로로 router 작성
//2. 언팔로우할 친구찾기
//3. 팔로우삭제 - removeFollowers
//4. 상태표시
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  console.log('유저아이디=', req.params.userId);
  console.log('내 아이디=', req.user.id);
  console.log('팔로우 삭제');
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



//10. 나를 팔로워한사람 차단
// DELETE :  localhost:3065/users/follower/:userId
//1. 위의 경로로 router 작성
//2. 차단할 친구찾기
//3. 팔로우삭제 - removeFollowers
//4. 상태표시
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {  //## 
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    await user.removeFollowings(req.user.id);  //##
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.get('/myPage/:userId', isLoggedIn, async (req, res, next) => {  //## 
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) { res.status(403).send('유저를 확인해주세요'); }  //403 금지된.없는유저

    await user.removeFollowings(req.user.id);  //##
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/sms/:phoneNum', async (req, res, next) => {
  try {

    console.log('phoneNum체크=', req.params.phoneNum);
    const coolsms = require('coolsms-node-sdk').default;
    //   // apiKey, apiSecret 설정
    const messageService = new coolsms('NCSDG7FZJFQFBRGJ', 'RHGMPTXD6CGBAYPE4FF6OE4LQPOZOPO9');
    const random = Math.random() * 1000000;
    let num = Math.round(random);
    const addNum = Math.random() * 10;

    //5자리이면 6자리 맞춤
    if (String(num).length < 6) {
      console.log('5자리', num);
      num = num + '' + Math.round(addNum)
    }


    //2건 이상의 메시지를 발송할 때는 sendMany, 단일 건 메시지 발송은 sendOne을 이용해야 합니다. 
    // const result = messageService.sendMany([
    //     {
    //       to: req.params.phoneNum, //보내는 대상 전화번호 
    //       from: '01085434277', // 보내는 사람 전화번호 
    //       text: '인증번호 ' + '[' + num + ']'
    //     }, // 여러명에게 보내고 싶다면 아래와 같이 {}을 더 추가해주면 됩니다.

    //     // {
    //     //   to: '01011111111', //보내는 대상 전화번호 
    //     //   from: '01012345678', // 보내는 사람 전화번호 
    //     //   text: num
    //     // },
    //   ])
    res.status(201).json(num);
  } catch (error) {
    console.log(error);
    next(error);
  }
})
var generateRandomNumber = function (min, max) {
  var randNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randNum;
}
const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  return { token, expires }
}
router.post('/email/:userEmail', async (req, res, next) => {
  try {

    //const number = generateRandomNumber(111111, 999999)
    const result = generateEmailVerificationToken();
    const { userEmail } = req.params; //사용자가 입력한 이메일

    const mailOptions = {
      from: "during4277@naver.com", // 발신자 이메일 주소.
      to: userEmail, //사용자가 입력한 이메일 -> 목적지 주소 이메일
      subject: " 인증 관련 메일 입니다. ",
      //html : '<h1>INSTAGRAM \n\n\n\n\n\n</h1>' + number
      html: `<p>링크를 클릭하면 비밀번호를 변경할 수 있습니다:</p>
        <p> <a href="http://localhost:3000/user/pwChange?userEmail=${userEmail}&token=${result.token}">Verify email</a></p>
        <p>This link will expire on ${result.expires}.</p>`
    }
    smtpTransport.sendMail(mailOptions, (err, response) => {
      console.log("response", response);
      //첫번째 인자는 위에서 설정한 mailOption을 넣어주고 두번째 인자로는 콜백함수.
      if (err) {
        res.json({ ok: false, msg: ' 메일 전송에 실패하였습니다. ' })
        smtpTransport.close() //전송종료
        return
      } else {
        res.json({ ok: true, msg: ' 메일 전송에 성공하였습니다. ', authNum: number })
        smtpTransport.close() //전송종료
        return
      }
    })
    res.status(201).json('email success');
  } catch (error) {
    console.log(error);
    next(error);
  }
})

// 차단한 사람 불러오기
router.get('/block', isLoggedIn, async (req, res, next) => {
  try {
    const blocks = await Blacklist.findAll({
      where: { blockingId: req.user.id },
      include: [{ model: User, as: 'Blocked' }],
    });
    res.status(200).json(blocks.map(b => b.Blocked));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 차단하기
router.patch('/:userId/block', isLoggedIn, async (req, res, next) => {
  console.log('차단 당하는 유저 아이디=', req.params.userId);
  console.log('내 아이디=', req.user.id);
  try {
    const me = await User.findOne({
      where: { id: req.user.id },
      include: [
        { model: User, as: 'Followings', attributes: ['id'] },
        { model: User, as: 'Followers', attributes: ['id'] },
      ],
    });

    const target = await User.findOne({
      where: { id: req.params.userId },
      include: [
        { model: User, as: 'Followings', attributes: ['id'] },
        { model: User, as: 'Followers', attributes: ['id'] },
      ],
    });

    if (!me || !target) {
      return res.status(403).send('유저를 확인해주세요');
    }

    // 내가 팔로우했으면 끊기
    if (me.Followings.some(u => u.id === target.id)) {
      await me.removeFollowings(target);
    }

    // 내가 팔로워로 등록되어 있으면 끊기
    if (me.Followers.some(u => u.id === target.id)) {
      await me.removeFollowers(target);
    }

    // 상대가 나를 팔로우했으면 끊기
    if (target.Followings.some(u => u.id === me.id)) {
      await target.removeFollowings(me);
    }

    // 상대가 나를 팔로워로 등록했으면 끊기
    if (target.Followers.some(u => u.id === me.id)) {
      await target.removeFollowers(me);
    }

    // 차단 등록
    await me.addBlocking(target);

    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error('🚨 차단 중 에러:', error);
    next(error);
  }
});

// 차단 삭제
router.delete('/:userId/block', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({ where: { id: req.user.id } });
    if (!me) {
      return res.status(403).send('유저를 확인해주세요');
    }

    await me.removeBlocking(req.params.userId);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error('🚨 차단 해제 중 에러:', error);
    next(error);
  }
});
/////////////////////////////////////
module.exports = router;
