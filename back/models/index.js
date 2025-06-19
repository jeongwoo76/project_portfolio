const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};  // 객체 생성하여 객체저장공간 만들기

const sequelize = new Sequelize(config.database, config.username, config.password, config);
//db, username, password, cinfig 설정정보 이용하여 인스턴스 생성

//#모델정의

db.User = require('./user')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Post = require('./post')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Prize = require('./prize')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Image = require('./image')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Hashtag = require('./hashtag')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Comment = require('./comment')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Animal = require('./animal')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Category = require('./category')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.OpenScope = require('./openScope')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Place = require('./place')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Group = require('./group')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.GroupMember = require('./groupmember')(sequelize, Sequelize);
db.GroupRequest = require('./groupRequest')(sequelize, Sequelize);
db.Complain = require('./complain')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Notification = require('./notification')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.NotificationSetting = require('./notificaionSetting')(sequelize, Sequelize);
db.Calendar = require('./calendar')(sequelize, Sequelize);  // 모듈연결   sequelize 실행

db.Chatting = require('./chatting')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.ChattingRoom = require('./chattingRoom')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.ChattingImage = require('./chattingImage')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.ChattingMember = require('./chattingMember')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.Blacklist = require('./blackList')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.MyPrize = require('./myPrize')(sequelize, Sequelize);  // 모듈연결   sequelize 실행
db.IssuedRandomBox = require('./issuedrandombox')(sequelize, Sequelize);
db.UserProfileImage = require('./userProfileImage')(sequelize, Sequelize);  // 모듈연결   sequelize 실행




//#모델 관계설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {  // model안에  modelName associate 가 있다면 
    db[modelName].associate(db);  // associate 실행
  }
});



db.sequelize = sequelize; //인스턴스
db.Sequelize = Sequelize; //라이브러리 db객체에 저장

module.exports = db; // 타 파일에서도 db 사용가능하게