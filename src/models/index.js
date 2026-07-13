const sequelize = require('../config/database');
const TrainingSession = require('./TrainingSession');

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  TrainingSession,
};

// Function to initialize and sync the database
db.initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // In production, you might want to use migrations, but for MVC Monolith development, sync is great.
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = db;
