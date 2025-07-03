const { Budget, BudgetCategory, Category } = require('../models');
const { validationResult } = require('express-validator');

const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id; // JWT decoded
    const { name, month, year, categories } = req.body;

    // Création du budget
    const newBudget = await Budget.create({
      name,
      month,
      year,
      user_id: userId,
    });

    // Insertion des catégories liées au budget
    const categoryRecords = await Promise.all(categories.map(async (cat) => {
      const category = await Category.findOrCreate({
        where: { name: cat.name, user_id: userId },
        defaults: { name: cat.name, user_id: userId }
      });

      return {
        budget_id: newBudget.id,
        category_id: category[0].id,
        allocated_amount: cat.allocated_amount,
        alert_threshold: cat.alert_threshold,
      };
    }));

    await BudgetCategory.bulkCreate(categoryRecords);

    return res.status(201).json({
      message: "Votre budget a été créé avec succès.",
      budget: newBudget,
    });

  } catch (error) {
    console.error("Erreur création budget :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du budget." });
  }
};

const updateBudget = async (req, res) => {
  try {
    // Vérification des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budgetId = req.params.id;
    const userId = req.user.id;
    const { name, month, categories } = req.body;

    // Vérification de l'existence du budget
    const budget = await Budget.findOne({ where: { id: budgetId, user_id: userId } });

    if (!budget) {
      return res.status(404).json({ message: "Budget introuvable." });
    }

    // Mise à jour des infos générales du budget
    budget.name = name || budget.name;
    budget.month = month || budget.month;
    await budget.save();

    // Traitement des catégories (suppression des anciennes, ajout des nouvelles)
    // 1. On supprime les anciennes relations BudgetCategory
    await BudgetCategory.destroy({ where: { budget_id: budgetId } });

    // 2. On traite les nouvelles catégories
    const categoryRecords = await Promise.all(categories.map(async (cat) => {
      // Soit une catégorie existante (id fourni), soit une nouvelle (à créer par nom)
      let category;

      if (cat.id) {
        category = await Category.findOne({ where: { id: cat.id, user_id: userId } });
        if (!category) throw new Error(`Catégorie avec l’ID ${cat.id} introuvable.`);
      } else {
        const [newCategory] = await Category.findOrCreate({
          where: { name: cat.name, user_id: userId },
          defaults: { name: cat.name, user_id: userId }
        });
        category = newCategory;
      }

      return {
        budget_id: budgetId,
        category_id: category.id,
        allocated_amount: cat.allocated_amount,
        alert_threshold: cat.alert_threshold,
      };
    }));

    // 3. Réinsertion des nouvelles relations
    await BudgetCategory.bulkCreate(categoryRecords);

    return res.status(200).json({
      message: "Le budget a été modifié avec succès.",
      updatedBudget: budget,
    });

  } catch (error) {
    console.error("Erreur modification budget:", error.message);
    return res.status(500).json({ message: "Erreur serveur lors de la modification du budget." });
  }
};

module.exports = {
  createBudget,
  updateBudget
};
