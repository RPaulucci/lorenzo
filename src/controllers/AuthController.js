const { AuthServiceFactory } = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = AuthServiceFactory.getService();
  }

  showLogin(req, res) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('pages/login', { error: null, success: null });
  }

  async login(req, res) {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.render('pages/login', {
        error: 'Por favor, preencha todos os campos.',
        success: null
      });
    }

    try {
      const result = await this.authService.login(identifier, password);
      
      if (result.success) {
        req.session.user = result.user;
        req.session.token = result.token;
        return res.redirect('/dashboard');
      } else {
        return res.render('pages/login', {
          error: result.message || 'Credenciais inválidas.',
          success: null
        });
      }
    } catch (error) {
      return res.render('pages/login', {
        error: 'Ocorreu um erro ao tentar fazer login. Tente novamente.',
        success: null
      });
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  }
}

module.exports = new AuthController();
