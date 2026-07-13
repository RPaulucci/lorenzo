const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./models');
const { requireAuth, redirectIfAuth } = require('./middlewares/authMiddleware');
const authController = require('./controllers/AuthController');
const dashboardController = require('./controllers/DashboardController');
const gameController = require('./controllers/GameController');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'math_reflex_secret_key_12345',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Global user session variable for template rendering
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes Definitions

// Home route redirects to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Authentication
app.get('/login', redirectIfAuth, (req, res) => authController.showLogin(req, res));
app.post('/login', redirectIfAuth, (req, res) => authController.login(req, res));
app.get('/logout', (req, res) => authController.logout(req, res));

// Protected Area
app.get('/dashboard', requireAuth, (req, res) => dashboardController.index(req, res));
app.get('/game/start', requireAuth, (req, res) => gameController.start(req, res));
app.post('/game/save', requireAuth, (req, res) => gameController.save(req, res));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado! Por favor, tente novamente mais tarde.');
});

// Sync database and start server
async function startServer() {
  try {
    // Initialize MySQL Database via Sequelize
    await db.initDatabase();
    
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`⚡ Reflexo Matemático running on: http://localhost:${PORT}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server due to database sync failure.');
    process.exit(1);
  }
}

startServer();
