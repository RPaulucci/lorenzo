const axios = require('axios');

class BaseAuthService {
  async login(identifier, password) {
    throw new Error('Method login() must be implemented');
  }

  async getProfile(token) {
    throw new Error('Method getProfile() must be implemented');
  }
}

class ExternalAuthService extends BaseAuthService {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl || process.env.AUTH_API_BASE_URL || 'https://lorenzo.mysite.dev.br';
  }

  async login(identifier, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        identifier, // can be email or username
        password
      });

      // The API should return { success: true, token: '...', user: { id, username, name, email } }
      if (response.data && response.data.token) {
        return {
          success: true,
          token: response.data.token,
          user: response.data.user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Credenciais inválidas.'
      };
    } catch (error) {
      console.error('ExternalAuthService.login error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar ao serviço de autenticação externo.'
      };
    }
  }

  async getProfile(token) {
    try {
      const response = await axios.get(`${this.baseUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        const profile = response.data.data;
        return {
          success: true,
          user: {
            id: profile.userId,
            username: profile.userName,
            name: profile.displayName || profile.userName,
            email: profile.email
          }
        };
      }

      return {
        success: false,
        message: 'Não foi possível recuperar o perfil.'
      };
    } catch (error) {
      console.error('ExternalAuthService.getProfile error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar ao serviço de perfil.'
      };
    }
  }
}

class MockAuthService extends BaseAuthService {
  constructor() {
    super();
    // Pre-populate mock users
    this.mockUsers = {
      'lorenzo': { id: 'usr_lorenzo', username: 'lorenzo', name: 'Lorenzo', email: 'lorenzo@mysite.dev.br' },
      'user@mysite.dev.br': { id: 'usr_123', username: 'estudante', name: 'Estudante da Matemática', email: 'user@mysite.dev.br' },
    };
  }

  async login(identifier, password) {
    // For demo/mock purposes, let's accept any login but if they use 'lorenzo' or a known key, return that.
    // Or if password is "error", simulate error.
    if (password === 'error') {
      return {
        success: false,
        message: 'Senha incorreta para fins de teste.'
      };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = this.mockUsers[cleanIdentifier] || {
      id: `usr_${Math.floor(Math.random() * 1000)}`,
      username: cleanIdentifier.split('@')[0],
      name: cleanIdentifier.split('@')[0].charAt(0).toUpperCase() + cleanIdentifier.split('@')[0].slice(1),
      email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@mysite.dev.br`
    };

    const mockToken = `mock_jwt_token_${Buffer.from(JSON.stringify(user)).toString('base64')}`;

    return {
      success: true,
      token: mockToken,
      user
    };
  }

  async getProfile(token) {
    if (!token || !token.startsWith('mock_jwt_token_')) {
      return {
        success: false,
        message: 'Token de autenticação inválido.'
      };
    }

    try {
      const base64Data = token.replace('mock_jwt_token_', '');
      const userData = JSON.parse(Buffer.from(base64Data, 'base64').toString('ascii'));
      return {
        success: true,
        user: userData
      };
    } catch (e) {
      return {
        success: false,
        message: 'Token corrompido.'
      };
    }
  }
}

class AuthServiceFactory {
  static getService() {
    const useMock = process.env.USE_MOCK_AUTH === 'true';
    if (useMock) {
      console.log('Using Mock Authentication Service.');
      return new MockAuthService();
    } else {
      console.log('Using External Authentication Service pointing to:', process.env.AUTH_API_BASE_URL);
      return new ExternalAuthService(process.env.AUTH_API_BASE_URL);
    }
  }
}

module.exports = {
  BaseAuthService,
  ExternalAuthService,
  MockAuthService,
  AuthServiceFactory
};
