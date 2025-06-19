module.exports = (sequelize, DataTypes) => {
  const GroupRequest = sequelize.define('GroupRequest', {
    GroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups',  // 그룹 테이블을 참조
        key: 'id'
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // 유저 테이블을 참조
        key: 'id'
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  GroupRequest.associate = (db) => {
    db.GroupRequest.belongsTo(db.Group);  // 그룹 테이블과 관계
    db.GroupRequest.belongsTo(db.User);   // 유저 테이블과 관계
  };

  return GroupRequest;
};
