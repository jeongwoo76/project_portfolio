// models/complain.js
module.exports = (sequelize, DataTypes) => {
  const Complain = sequelize.define('Complain', {
    targetType: {
      type: DataTypes.STRING(255), // TARGET_TYPE.js
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER, // 실제 Comment.id, User.id, Post.id
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255), // 선택사항: 신고 사유
      allowNull: true,
    },
    isBlind: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  Complain.associate = (db) => {
    Complain.belongsTo(db.User, {
      foreignKey: {
        name: 'ReporterId',
        allowNull: false,
      },
      as: 'Reporter',
    });
  };


  return Complain;
};
