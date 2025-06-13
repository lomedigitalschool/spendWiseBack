const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard'); 
const { sequelize } = require('./Models'); 

const app = express();

app.use(express.json());
app.use(cors()) ;


app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes); 

const PORT = process.env.PORT || 5000;

// Synchronisation de la base de données et démarrer le serveur
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Base de donnée synchronisée");
    app.listen(PORT, () => console.log(`Server démarré sur le port ${PORT}`));
  })
  .catch((err) => {

    console.error("Erreur de synchronisation avec la base de données :", err);

  });


