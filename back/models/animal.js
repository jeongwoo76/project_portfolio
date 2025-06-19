module.exports = (sequelize, DataTypes) => {
  const Animal = sequelize.define('Animal', {
    aniName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    aniAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0 // 음수방지
      }
    },
    aniProfile: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
  // 관계설정
  Animal.associate = (db) => {
    db.Animal.belongsTo(db.User);

    db.Animal.belongsToMany(db.Animal, {
      through: 'Friends',
      as: 'Followings', // 내가 팔로우한 동물들
      foreignKey: 'FollowerId',
      otherKey: 'FollowingId',
    });
    db.Animal.belongsToMany(db.Animal, {
      through: 'Friends',
      as: 'Followers', // 나를 팔로우한 동물들
      foreignKey: 'FollowingId',
      otherKey: 'FollowerId',
    });


    db.Animal.belongsTo(db.Category);
  };
  return Animal;
}