const { AuthServiceFactory } = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = AuthServiceFactory.getService();
  }

  async showLogin(req, res) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }

    const token = req.query.token;
    if (token) {
      return this.handleTokenLogin(req, res, token);
    }

    const useMock = process.env.USE_MOCK_AUTH === 'true';
    if (useMock) {
      // In development / mock mode, simulate successful SSO redirect back with a mock token
      const mockUser = { id: 'usr_lorenzo', username: 'lorenzo', name: 'Lorenzo', email: 'lorenzo@mysite.dev.br' };
      const mockToken = `mock_jwt_token_${Buffer.from(JSON.stringify(mockUser)).toString('base64')}`;
      return res.redirect(`/login?token=${mockToken}`);
    }

    // Redirect to external login page
    const accountUrl = process.env.ACCOUNT_URL || 'https://account.mysite.dev.br';
    const appHost = process.env.DOCKER_APP_HOST || req.get('host');
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const redirectUri = encodeURIComponent(`${protocol}://${appHost}/login`);

    return res.redirect(`${accountUrl}?redirect=${redirectUri}`);
  }

  async handleTokenLogin(req, res, token) {
    try {
      const result = await this.authService.getProfile(token);

      if (result.success) {
        req.session.user = result.user;
        req.session.token = token;
        return res.redirect('/dashboard');
      } else {
        return res.status(401).send(
          `<h3>Erro na Autenticação</h3>
           <p>${result.message || 'Token inválido ou expirado.'}</p>
           <p>Por favor, tente fazer login novamente no portal: <a href="${process.env.ACCOUNT_URL || 'https://account.mysite.dev.br'}">account.mysite.dev.br</a></p>`
        );
      }
    } catch (error) {
      console.error('Error handling token login:', error);
      return res.status(500).send('Erro interno ao tentar validar sua sessão. Por favor, tente novamente mais tarde.');
    }
  }

  // POST /login is no longer used since login is handled externally,
  // but we redirect to GET /login just in case it is called.
  login(req, res) {
    res.redirect('/login');
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      
      const useMock = process.env.USE_MOCK_AUTH === 'true';
      if (useMock) {
        return res.redirect('/login');
      }

      // Optional: redirect to external logout page to clear the SSO session
      const accountUrl = process.env.ACCOUNT_URL || 'https://account.mysite.dev.br';
      res.redirect(`${accountUrl}/logout`);
    });
  }
}

module.exports = new AuthController();
