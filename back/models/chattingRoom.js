module.exports = (  sequelize , DataTypes   ) => { 
  /// const User
  const ChattingRoom = sequelize.define('ChattingRoom', {//users테이블  - 자동으로 s 붙어서 생성
    //id 기본값으로 자동설정
    title: {
      type: DataTypes.STRING(255), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      allowNull: false, // 필수
    }, 
  }, {
    charset : 'utf8', 
    collate: 'utf8_general_ci',  // 한글저장   
  });  
  /// 관계설정
  ChattingRoom.associate = (db) => { 
    //다 대 다
    db.ChattingRoom.belongsToMany(db.User, { through: db.ChattingMember ,foreignKey:'ChattingRoomId'});
    //일 대 다 
    //Notification
    db.ChattingRoom.hasMany(db.Chatting);
    //다 대 일
  }; 
  return ChattingRoom;
};