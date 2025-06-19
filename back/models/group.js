module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });
  Group.associate = (db) => {
    db.Group.hasMany(db.Post);
    db.Group.belongsTo(db.OpenScope);
    db.Group.belongsToMany(db.Category, { through: 'GroupCategory'});
    db.Group.belongsToMany(db.User, { through: 'GroupMember', as: 'groupmembers' })
  }
  return Group;
};

/*
그룹은 하나의 공개범위를 가짐 하나의 공개범위는 많은 그룹을 가짐 다대1 belongsTo
그룹은 많은 유저를 가질 수 있음 - 유저는 많은 그룹을 가질 수 있음 다대다 belongsToMany
그룹은 많은 카테고리를 가질 수 있음 카테고리는 많은 그룹을 가질 수있음 다대다 belongsToMany
그룹은 많은 포스트를 가질 수 있음 1대다 hasmany
*/

