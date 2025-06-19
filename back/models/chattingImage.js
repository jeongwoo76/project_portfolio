module.exports = (  sequelize , DataTypes   ) => { 
  /// const User
  const ChattingImage = sequelize.define('ChattingImage', {//users테이블  - 자동으로 s 붙어서 생성
    //id 기본값으로 자동설정
    src: {
      type: DataTypes.STRING(255), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      allowNull: false, // 필수
    }, 
  }, {
    charset : 'utf8', 
    collate: 'utf8_general_ci',  // 한글저장   
  });  
  /// 관계설정
  ChattingImage.associate = (db) => { 

    //다 대 일
    db.ChattingImage.belongsTo(db.Chatting);
  }; 
  return ChattingImage;
};


