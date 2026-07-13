const gameService = require('../services/GameService');
const TrainingSession = require('../models/TrainingSession');

class GameController {
  start(req, res) {
    const { operation, level } = req.query;

    // Validate inputs
    const validOperations = ['addition', 'subtraction', 'multiplication', 'division'];
    if (!validOperations.includes(operation)) {
      return res.redirect('/dashboard');
    }

    const levelInt = parseInt(level, 10);
    if (isNaN(levelInt) || levelInt < 1 || levelInt > 10) {
      return res.redirect('/dashboard');
    }

    try {
      // Generate 10 questions for this session
      const questions = gameService.generateSessionQuestions(operation, levelInt, 10);

      // Map operation internal values to children symbols and readable names
      const operationMeta = {
        addition: { name: 'Adição', symbol: '+' },
        subtraction: { name: 'Subtração', symbol: '-' },
        multiplication: { name: 'Multiplicação', symbol: '×' },
        division: { name: 'Divisão', symbol: '÷' }
      };

      res.render('pages/game', {
        user: req.session.user,
        operation,
        level: levelInt,
        meta: operationMeta[operation],
        questionsJson: JSON.stringify(questions),
        questions
      });
    } catch (error) {
      console.error('GameController.start error:', error);
      res.status(500).send('Erro ao iniciar a sessão de treinamento.');
    }
  }

  async save(req, res) {
    const { operation, level, score, totalTimeSeconds, correctAnswers, incorrectAnswers } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
    }

    try {
      const session = await TrainingSession.create({
        userId: user.id,
        username: user.name || user.username,
        operation,
        level: parseInt(level, 10),
        score: parseInt(score, 10),
        totalTimeSeconds: parseFloat(totalTimeSeconds),
        correctAnswers: parseInt(correctAnswers, 10),
        incorrectAnswers: parseInt(incorrectAnswers, 10)
      });

      res.json({
        success: true,
        sessionId: session.id
      });
    } catch (error) {
      console.error('GameController.save error:', error);
      res.status(500).json({ success: false, message: 'Erro ao salvar os resultados no banco de dados.' });
    }
  }
}

module.exports = new GameController();
