module.exports = (  sequelize , DataTypes   ) => { 
  /// const User
  const ChattingMember = sequelize.define('ChattingMember', {//users테이블  - 자동으로 s 붙어서 생성
    //id 기본값으로 자동설정
    roleUser: { // leader , user
      type: DataTypes.STRING(45), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      allowNull: false, // 필수
    }, 
    joinedAt: { // 타임스탬프는 기본적으로 포함되지만, 명시적으로 정의 가능
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {
    charset : 'utf8', 
    collate: 'utf8_general_ci',  // 한글저장   
  });  
  return ChattingMember;
};