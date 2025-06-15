module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Cette catégorie existe déjà.'
      },
      validate: {
        notEmpty: { msg: 'Le nom de la catégorie est requis.' },
        len: { args: [2, 50], msg: 'Le nom de la catégorie doit contenir entre 2 et 50 caractères.' }
      }
    }
  }, {
    tableName: 'Categories',
    timestamps: true,
    underscored: true
  });

  return Category;
};
