const { body } = require('express-validator');
// Middleware pour la validation des budgets
const validateBudgetCreation = [
  body('name')
    .notEmpty().withMessage("Le nom du budget est requis.")
    .isLength({ min: 3 }).withMessage("Le nom du budget doit contenir au moins 3 caractères."),
  body('month')
    .isInt({ min: 1, max: 12 }).withMessage("Le mois doit être compris entre 1 et 12."),
  body('year')
    .isInt({ min: 2024 }).withMessage("L'année doit être valide."),
  body('categories')
    .isArray({ min: 1 }).withMessage("Au moins une catégorie doit être définie."),
  body('categories.*.category_id')
    .isInt({ min: 1 }).withMessage("ID de catégorie invalide."),
  body('categories.*.allocated_amount')
    .isFloat({ gt: 0 }).withMessage("Le montant doit être supérieur à 0."),
  body('categories.*.alert_threshold')
    .isFloat({ min: 0, max: 100 }).withMessage("Le pourcentage d'alerte doit être entre 0 et 100.")
    .custom((value) => value !== 0 || value === null).withMessage("0 désactive les alertes, utilisez null pour le défaut"),
  body('categories.*.name')
    .optional()
    .isLength({ min: 3 }).withMessage("Le nom de catégorie doit faire 3 caractères minimum")
];

// Middleware pour la validation des budgets
const validateBudgetUpdate = [
  body("name")
    .notEmpty().withMessage("Le nom du budget est obligatoire.")
    .isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caractères."),
  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Le mois doit être entre 1 et 12."),
  body("year")
    .isInt({ min: 2024 })
    .withMessage("L'année doit être valide."),
  body("categories")
    .isArray({ min: 1 }).withMessage("Au moins une catégorie est requise."),
  body("categories.*.id")
    .isInt({ min: 1 }).withMessage("ID de catégorie invalide."),
  body("categories.*.allocated_amount")
    .isFloat({ min: 0.01 })
    .withMessage("Le montant doit être supérieur à 0."),
  body("categories.*.alert_threshold")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Le seuil d'alerte doit être entre 0 et 100."),
  body("categories.*.name")
    .optional()
    .isLength({ min: 3 }).withMessage("Le nom de catégorie doit faire 3 caractères minimum")
];

const validateBudgetCategoryUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3 }).withMessage("Le nom de la catégorie doit contenir au moins 3 caractères."),
  body('allocated_amount')
    .isFloat({ gt: 0 }).withMessage("Le montant alloué doit être supérieur à 0."),
  body('alert_threshold')
    .isFloat({ min: 0, max: 100 }).withMessage("Le seuil d'alerte doit être entre 0 et 100.")
    .custom((value) => value !== 0 || value === null).withMessage("0 désactive les alertes, utilisez null pour le défaut")
];

module.exports = { 
  validateBudgetCreation,
  validateBudgetUpdate,
  validateBudgetCategoryUpdate
};