module.exports = (sequelize, DataTypes) => {
  const Blacklist = sequelize.define('Blacklist', {
    // 필요 시 필드 추가 가능 (예: 차단 시각 등)
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  Blacklist.associate = (db) => {
    Blacklist.belongsTo(db.User, {
      as: 'Blocked', // 차단 당한 사람
      foreignKey: 'BlockedId',
    });

    Blacklist.belongsTo(db.User, {
      as: 'Blocking', // 차단한 사람
      foreignKey: 'BlockingId',
    });
  };
  return Blacklist;
};