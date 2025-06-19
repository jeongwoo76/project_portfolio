module.exports = (sequelize, DataTypes) => {
  const MyPrize = sequelize.define('MyPrize', {
    id: {                        // PK로 사용할 고유 ID 추가 (auto increment)
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    issuedReason: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true, // 사용 전엔 null
    },
    dueAt: {
      type: DataTypes.DATE,
      allowNull: false  // Prize의 dueAt을 복사해서 초기화
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,  
      unique: true,
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    //timestamps: false
  });

  // 관계 설정
  MyPrize.associate = (db) => {
    db.MyPrize.belongsTo(db.User, { foreignKey: 'UserId', as: 'user' });
    db.MyPrize.belongsTo(db.Prize, { foreignKey: 'PrizeId', as: 'prize' });
  };

  return MyPrize;
};
