module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom est requis.' },
        len: { args: [2, 50], msg: 'Le nom doit contenir entre 2 et 50 caractères.' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Cet email est déjà utilisé.' },
      validate: {
        isEmail: { msg: 'Email invalide.' },
        notEmpty: { msg: 'L’email est requis.' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le mot de passe est requis.' },
        len: { args: [6, 100], msg: 'Le mot de passe doit contenir au moins 6 caractères.' }
      }
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      validate: {
        isFloat: { msg: 'Le solde doit être un nombre.' },
        min: { args: [0], msg: 'Le solde ne peut pas être négatif.' }
      }
    }
  }, {
    tableName: 'Users',         // Nom de la table pour éviter des noms imprévus
    timestamps: true,           // Ajoute automatiquement createdAt et updatedAt
    underscored: true           // created_at au lieu de createdAt (option de style)
  });

  return User;
};
