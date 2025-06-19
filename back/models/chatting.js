module.exports = (  sequelize , DataTypes   ) => { 
  /// const User
  const Chatting = sequelize.define('Chatting', {//users테이블  - 자동으로 s 붙어서 생성
    //id 기본값으로 자동설정
    chatContent: {
      type: DataTypes.STRING(255), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      allowNull: false, // 필수
    }, 
    contentType: {
      type: DataTypes.STRING(45), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      allowNull: false, // 필수
    }, 
  }, {
    charset : 'utf8', 
    collate: 'utf8_general_ci',  // 한글저장   
  });  
  /// 관계설정
  Chatting.associate = (db) => { 
    //일 대 다 
    //Notification
    db.Chatting.hasMany(db.ChattingImage);
    //다 대 일
    db.Chatting.belongsTo(db.User);
    db.Chatting.belongsTo(db.ChattingRoom);
  }; 
  return Chatting;
};