module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    content: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isAnimal: {
      type: DataTypes.BOOLEAN
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });

  Category.associate = (db) => {
    db.Category.belongsToMany(db.Group, { through: 'GroupCategory' });
    db.Category.hasMany(db.Prize, { as: 'prizes' });
    Category.hasMany(db.IssuedRandomBox, { foreignKey: 'CategoryId' });
    db.Category.hasMany(db.Animal);
    db.Category.belongsToMany(db.Post, { through: 'PostCategory' });
  }
  return Category;
}

/*
카테고리:상품 다대다
카테고리:그룹 다대다
카테고리:동물 다대다
카테고리:게시글 다대다
 */

