const TrainingSession = require('../models/TrainingSession');
const { sequelize } = require('../models');

class DashboardController {
  async index(req, res) {
    try {
      const user = req.session.user;
      
      // Fetch user's session history
      const sessions = await TrainingSession.findAll({
        where: { userId: user.id },
        order: [['created_at', 'DESC']],
        limit: 20
      });

      // Calculate statistics
      const statsResult = await TrainingSession.findOne({
        where: { userId: user.id },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
          [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
          [sequelize.fn('SUM', sequelize.col('correct_answers')), 'totalCorrect'],
          [sequelize.fn('SUM', sequelize.col('total_time_seconds')), 'totalTime']
        ],
        raw: true
      });

      const stats = {
        totalSessions: statsResult.totalSessions || 0,
        avgScore: statsResult.avgScore ? parseFloat(statsResult.avgScore).toFixed(1) : '0.0',
        totalCorrect: statsResult.totalCorrect || 0,
        totalTime: statsResult.totalTime ? Math.round(statsResult.totalTime) : 0
      };

      // Format operations names for UI display
      const operationMap = {
        addition: { name: 'Adição', symbol: '+', color: 'blue' },
        subtraction: { name: 'Subtração', symbol: '-', color: 'red' },
        multiplication: { name: 'Multiplicação', symbol: '×', color: 'orange' },
        division: { name: 'Divisão', symbol: '÷', color: 'purple' }
      };

      res.render('pages/dashboard', {
        user,
        sessions,
        stats,
        operationMap
      });
    } catch (error) {
      console.error('DashboardController.index error:', error);
      res.status(500).send('Erro interno do servidor ao carregar o painel.');
    }
  }
}

module.exports = new DashboardController();
