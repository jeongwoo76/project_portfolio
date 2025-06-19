const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local'); 
// passport-local 인증전략: - 이메일, 비밀번호
const bcrypt = require('bcrypt'); // 암호화비교
const { User } = require('../models'); // User 객체 - users 테이블가져오기

module.exports = () => {
  
  passport.use( new LocalStrategy({  // 1단계: email, password
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {  // 2단계
    try{
      //1. 이메일 이용해서 사용자 찾기 - select *from users where email='email'
      const user = await User.findOne({where: {email}});
      //2. 없다면 존재하지 않는 이메일
      if(!user) { return done( null, false, {reason: '존재하지 않는 이메일입니다.'} ); }
      //3, 비밀번호와 암호화된 비밀번호 비교하기 - 사용자정보저장 / 아니라면 비밀번호가 틀렸습니다.
      const result = await bcrypt.compare( password, user.password );
      if(result) { return done(null, user); }
      return done( null, false, {reason: '비밀번호가 틀렸습니다.'} ); // 실패메시지
    } catch(error) {
      console.error(error);
      return done(error);
    }
  }));
};