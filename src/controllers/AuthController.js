const { AuthServiceFactory } = require('../services/AuthService');
const TrainingSession = require('../models/TrainingSession');

class AuthController {
  constructor() {
    this.authService = AuthServiceFactory.getService();
  }

  async showLogin(req, res) {
    console.log('[AUTH] showLogin called. Query:', req.query, 'Session user:', req.session?.user);
    if (req.session.user) {
      console.log('[AUTH] Session already exists, redirecting to /dashboard');
      return res.redirect('/dashboard');
    }

    const useMock = process.env.USE_MOCK_AUTH === 'true';
    if (useMock) {
      // In mock mode, if we don't have token in query, we redirect to generate a mock token
      const token = req.query.token;
      if (!token) {
        console.log('[AUTH] Using mock authentication...');
        const mockUser = { id: 'usr_lorenzo', username: 'lorenzo', name: 'Lorenzo', email: 'lorenzo@mysite.dev.br' };
        const mockToken = `mock_jwt_token_${Buffer.from(JSON.stringify(mockUser)).toString('base64')}`;
        return res.redirect(`/login?token=${mockToken}&refreshToken=mock_refresh_token&userId=${mockUser.id}&email=${mockUser.email}&name=${mockUser.name}`);
      }
    }

    return res.render('pages/login', { error: null });
  }

  async syncSession(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    try {
      const result = await this.authService.getProfile(token);
      console.log('[AUTH] syncSession getProfile result:', result);

      if (result.success) {
        const user = result.user;
        req.session.user = user;
        req.session.token = token;
        console.log('[AUTH] Sync session created for user:', user);

        // If there is a pending session from guest mode, save it now
        if (req.session.pendingSession) {
          try {
            console.log('[AUTH] Saving pending training session for user:', user.id);
            await TrainingSession.create({
              userId: user.id,
              username: user.name || user.username,
              ...req.session.pendingSession
            });
            delete req.session.pendingSession;
            req.session.successMessage = 'Seu treino de teste foi salvo com sucesso no seu perfil!';
          } catch (dbError) {
            console.error('[AUTH] Error saving pending session after sync:', dbError);
          }
        }

        return res.json({ success: true, user });
      } else {
        console.warn('[AUTH] Sync session failed:', result.message);
        return res.status(401).json({ success: false, message: result.message || 'Token inválido ou expirado.' });
      }
    } catch (error) {
      console.error('Error syncing session:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao sincronizar sessão.' });
    }
  }

  // handleTokenLogin is kept for backward compatibility if needed, but client-side sync is preferred.
  async handleTokenLogin(req, res, token) {
    console.log('[AUTH] handleTokenLogin. Token preview:', token ? token.substring(0, 15) + '...' : 'null');
    try {
      const result = await this.authService.getProfile(token);
      console.log('[AUTH] getProfile result:', result);

      if (result.success) {
        const user = result.user;
        req.session.user = user;
        req.session.token = token;
        console.log('[AUTH] Session created for user:', user);

        // If there is a pending session from guest mode, save it now
        if (req.session.pendingSession) {
          try {
            console.log('[AUTH] Saving pending training session for user:', user.id);
            await TrainingSession.create({
              userId: user.id,
              username: user.name || user.username,
              ...req.session.pendingSession
            });
            delete req.session.pendingSession;
            req.session.successMessage = 'Seu treino de teste foi salvo com sucesso no seu perfil!';
          } catch (dbError) {
            console.error('[AUTH] Error saving pending session after login:', dbError);
          }
        }

        return res.redirect('/dashboard');
      } else {
        console.warn('[AUTH] Authentication failed:', result.message);
        return res.status(401).send(
          `<h3>Erro na Autenticação</h3>
           <p>${result.message || 'Token inválido ou expirado.'}</p>
           <p>Por favor, tente fazer login novamente no portal: <a href="${process.env.ACCOUNT_URL || 'https://accounts.mysite.dev.br'}">accounts.mysite.dev.br</a></p>`
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
        return res.send(`
          <script>
            localStorage.clear();
            window.location.href = '/login';
          </script>
        `);
      }

      // Redirect to external logout page to clear the SSO session
      const accountUrl = process.env.ACCOUNT_URL || 'https://accounts.mysite.dev.br';
      return res.send(`
        <script>
          localStorage.clear();
          window.location.href = '${accountUrl.replace(/\/$/, '')}/logout';
        </script>
      `);
    });
  }
}

module.exports = new AuthController();
