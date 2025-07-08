const { Transaction, BudgetCategory, Category } = require('../models');

/**
 * Fonction pour vérifier si les dépenses ont dépassé les seuils d'alerte
 * ou les 100 % du montant alloué à une catégorie dans un budget.
 *
 * @param {number} allocatedAmount - Montant alloué à la catégorie (budget).
 * @param {number} totalSpent - Total des dépenses effectuées pour cette catégorie.
 * @param {number} alertThreshold - Pourcentage défini par l'utilisateur (ex. 80).
 *
 * @returns {Object} - Contient les informations d'alerte déclenchée.
 */
function checkAlerts(allocatedAmount, totalSpent, alertThreshold) {
  const response = {
    thresholdAlertTriggered: false,
    hundredPercentAlertTriggered: false,
    percentSpent: 0,
    message: null,
    categoryId: null,
    budgetId: null
  };

  if (allocatedAmount <= 0 || alertThreshold === 0) {
    return response; // Évite division par zéro ou seuil désactivé
  }

  const percentSpent = (totalSpent / allocatedAmount) * 100; // Calcul du pourcentage de depenses
  response.percentSpent = Math.round(percentSpent * 100) / 100;// Arrondi au centieme

  if (percentSpent >= 100) {
    response.hundredPercentAlertTriggered = true;
    response.message = `🚨 Budget dépassé pour la catégorie. Dépenses à ${response.percentSpent}%`;
  } else if (percentSpent >= alertThreshold) {
    response.thresholdAlertTriggered = true;
    response.message = `⚠️ Alerte : ${response.percentSpent}% du budget atteint pour cette catégorie`;
  }

  return response;
}

/**
 * Vérifie les alertes déclenchées pour une catégorie d'un budget.
 * @param {number} budgetId - ID du budget concerné
 * @param {number} categoryId - ID de la catégorie concernée
 * @returns {Object|null} - Objet d'alerte ou null si aucune alerte
 */
const getCategoryAlert = async (budgetId, categoryId) => {
  try {
    const budgetCategory = await BudgetCategory.findOne({
      where: {
        budget_id: budgetId,
        category_id: categoryId
      }
    });

    if (!budgetCategory) return null;

    const totalSpent = await Transaction.sum('amount', {
      where: {
        budget_category_id: budgetCategory.id, // ✅ CORRIGÉ
        type: 'expense'
      }
    });

    const category = await Category.findByPk(categoryId);

    const alert = checkAlerts(
      parseFloat(budgetCategory.allocated_amount),
      parseFloat(totalSpent || 0),
      parseFloat(budgetCategory.alert_threshold)
    );

    return {
      ...alert,
      categoryId,
      budgetId,
      categoryName: category?.name || 'Catégorie inconnue',
      allocatedAmount: budgetCategory.allocated_amount,
      alertThreshold: budgetCategory.alert_threshold
    };
  } catch (error) {
    console.error("Erreur getCategoryAlert :", error.message);
    if (process.env.NODE_ENV === 'production') {
      return {
        error: 'Une erreur est survenue lors de la vérification des alertes',
        categoryId,
        budgetId
      };
    }
    return {
      error: error.message,
      categoryId,
      budgetId
    };
  }
};


module.exports = {
  checkAlerts,
  getCategoryAlert
};