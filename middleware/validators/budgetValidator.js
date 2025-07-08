const { body } = require('express-validator');

const validateBudgetCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage("Le nom du budget est requis")
    .isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caractères"),
  
  body('month')
    .isInt({ min: 1, max: 12 }).withMessage("Le mois doit être entre 1 et 12"),
  
  body('year')
    .isInt({ min: 2000 }).withMessage("L'année doit être valide"),
  
  body('categories')
    .isArray({ min: 1 }).withMessage("Au moins une catégorie est requise"),
  
  body('categories.*.name')
    .trim()
    .notEmpty().withMessage("Le nom de la catégorie est requis")
    .isLength({ min: 3 }).withMessage("Le nom de catégorie doit contenir au moins 3 caractères"),
  
  body('categories.*.allocated_amount')
    .isFloat({ gt: 0 }).withMessage("Le montant alloué doit être supérieur à 0"),
  
  body('categories.*.alert_threshold')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage("Le seuil d'alerte doit être entre 0 et 100%")
];

const validateBudgetUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caractères"),
  
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage("Le mois doit être entre 1 et 12"),
  
  body('year')
    .optional()
    .isInt({ min: 2000 }).withMessage("L'année doit être valide"),
  
  body('categories')
    .optional()
    .isArray({ min: 1 }).withMessage("Au moins une catégorie est requise"),
  
  body('categories.*.id')
    .optional()
    .isInt().withMessage("L'ID de catégorie doit être un nombre"),
  
  body('categories.*.name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage("Le nom de catégorie doit contenir au moins 3 caractères"),
  
  body('categories.*.allocated_amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage("Le montant alloué doit être supérieur à 0"),
  
  body('categories.*.alert_threshold')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage("Le seuil d'alerte doit être entre 0 et 100%")
];

const validateBudgetCategoryUpdate = [
  body('allocated_amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage("Le montant alloué doit être supérieur à 0"),
  
  body('alert_threshold')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage("Le seuil d'alerte doit être entre 0 et 100%"),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage("Le nom de catégorie doit contenir au moins 3 caractères")
];

module.exports = {
  validateBudgetCreation,
  validateBudgetUpdate,
  validateBudgetCategoryUpdate
};