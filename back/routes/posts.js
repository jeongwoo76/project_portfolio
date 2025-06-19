const express = require('express');
const router = express.Router();
const { Post, User, Image, Comment, OpenScope, Category, Blacklist, UserProfileImage } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res, next) => {
  try {
    const where = {};

    const userId = req.query.userId;
    const number = req.query.number;
    const lastId = parseInt(req.query.lastId, 10);

    console.log('req.query:', req.query);
    console.log('req.user?.id:', req.user?.id);

    // 무한 스크롤용
    if (lastId) {
      where.id = { [Op.lt]: lastId };
    }

    // 마이페이지: 로그인 상태에서 본인 글
    if (userId === 'undefined' && number === '1' && req.user) {
      where.UserId = req.user.id;
    }

    // 다른 사람의 유저 페이지
    if (userId && userId !== 'undefined' && number === '2' && req.user) {
      where.UserId = parseInt(userId, 10);
    }

    // 로그인 상태인 경우 차단된 사용자 목록 가져오기
    if (req.user) {
      const blockedUsers = await Blacklist.findAll({
        where: {
          [Op.or]: [
            { BlockingId: req.user.id },  // 내가 차단한 사람들
            { BlockedId: req.user.id },   // 나를 차단한 사람들
          ],
        },
      });

      // 차단된 유저 아이디 배열 추출
      const blockedUserIds = blockedUsers.map(b => 
        b.BlockingId === req.user.id ? b.BlockedId : b.BlockingId
      );

if (req.user && blockedUserIds.length > 0) {
  // 본인 id는 차단 목록에서 제외
  const filteredBlockedUserIds = blockedUserIds.filter(id => id !== req.user.id);

  if (where.UserId) {
    // 특정 유저 글만 보는 경우: 
    // 그 유저가 차단당한 사람인지 체크해서, 차단당한 사람이라면 빈 결과 나오도록 처리 가능
    if (filteredBlockedUserIds.includes(where.UserId)) {
      // 차단된 유저라면 아예 조건 맞는 글 없음
      where.UserId = -1; // 존재하지 않는 id로 강제 처리
    }
    // 아니면 그대로 where.UserId 유지
  } else {
    // 전체 글 조회 시 차단된 유저 글 제외
    where.UserId = { [Op.notIn]: filteredBlockedUserIds };
  }
}
    }

    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC']
      ],
      include: [
        { model: User, attributes: ['id', 'nickname', 'isAdmin'] 
          , include: [{model:UserProfileImage}]
        },
        { model: Image },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'nickname', 'isAdmin'] }],
        },
        { model: User, as: 'Likers', attributes: ['id'] },
        {
          model: Post,
          as: 'Retweet',
          include: [
            { model: User, attributes: ['id', 'nickname'] },
            { model: Image },
          ],
        },
        { model: OpenScope },
        {
          model: Category,
          as: 'Categorys',
          through: { attributes: [] },
          attributes: ['id', 'content', 'isAnimal'],
        },
      ],
    });

if (req.user) {
  const blockedUsers = await Blacklist.findAll({
    where: {
      [Op.or]: [
        { BlockingId: req.user.id },
        { BlockedId: req.user.id },
      ],
    },
  });

  const blockedUserIds = blockedUsers.map(b =>
    b.BlockingId === req.user.id ? b.BlockedId : b.BlockingId
  );

  posts.forEach((post) => {
    if (post.Retweet && post.Retweet.User) {
      const retweetUserId = post.Retweet.User.id;
      if (blockedUserIds.includes(retweetUserId)) {
        post.Retweet.dataValues.isBlocked = true;
      }
    }
  });
}
    //console.dir('실행=',fullPost.User, { depth: 10 });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;