// adminAuth.js 관리자 로그인 라우트
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { isNotLoggedIn } = require('./middlewares');

// 관리자 로그인 폼 제출 라우트
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, adminUser, info) => {
    if (err) return next(err);
    if (!adminUser) return res.status(401).send('로그인 실패');

    // 로그인 성공 시 세션에 저장하고 isAdmin 플래그 추가
    req.login(adminUser, (err) => {
      if (err) return next(err);
      // 여기서 isAdmin 플래그 직접 추가
      req.user.isAdmin = true;
      res.redirect('/admin');  // 관리자 페이지로 이동
    });
  })(req, res, next);
});

module.exports = router;
