// SSO Client-side Integration for lorenzo.mysite.dev.br

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const name = urlParams.get('name');

    // Configure client-side SSO variables from global config injected by EJS
    const config = window.SSO_CONFIG || {
        accountUrl: 'https://accounts.mysite.dev.br',
        apiUrl: 'https://api.mysite.dev.br',
        useMock: false
    };

    const userIsAuthenticatedOnServer = window.USER_IS_AUTHENTICATED || false;

    // Passo 2: Captura de Tokens e Perfil Pós-Redirecionamento
    if (token && refreshToken) {
        // Salva a sessão no site externo
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_profile', JSON.stringify({ userId, email, name }));

        // Limpa a barra de endereço removendo os parâmetros contendo segredos
        window.history.replaceState({}, document.title, window.location.pathname);

        console.log("Autenticado via SSO com sucesso!");

        // Sincroniza a sessão com o servidor Express
        syncServerSession(token, refreshToken);
    } else {
        const savedToken = localStorage.getItem('auth_token');
        const savedRefreshToken = localStorage.getItem('refresh_token');
        
        // Se temos um token salvo localmente, mas a sessão no servidor expirou/não existe, sincroniza
        if (savedToken && savedRefreshToken && !userIsAuthenticatedOnServer) {
            syncServerSession(savedToken, savedRefreshToken);
        }
        
        // Passo 1: Redirecionamento para Login (Se não autenticado e no endpoint /login)
        if (!savedToken && window.location.pathname === '/login' && !config.useMock) {
            redirectToLogin();
        }
    }

    // Função para sincronizar o token com o servidor Express
    async function syncServerSession(token, refreshToken) {
        try {
            const response = await fetch('/auth/sync-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, refreshToken })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log("Sessão sincronizada com o servidor!");
                    if (!userIsAuthenticatedOnServer) {
                        window.location.reload();
                    }
                } else {
                    console.warn("Falha ao sincronizar sessão. Tentando atualizar token...");
                    await handleTokenRefresh();
                }
            } else if (response.status === 401) {
                console.warn("Token expirado no servidor. Tentando atualizar token...");
                await handleTokenRefresh();
            } else {
                console.error("Erro inesperado ao sincronizar sessão:", response.statusText);
            }
        } catch (err) {
            console.error("Erro na requisição de sincronização:", err);
        }
    }

    // Passo 4: Atualização Silenciosa de Token (Silent Refresh)
    async function handleTokenRefresh() {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            redirectToLogin();
            return;
        }

        try {
            const response = await fetch(`${config.apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const result = await response.json();

                // Atualiza os novos tokens retornados
                const newAccessToken = result.data?.accessToken || result.data?.token || result.accessToken;
                const newRefreshToken = result.data?.refreshToken || result.refreshToken;

                if (newAccessToken) {
                    localStorage.setItem('auth_token', newAccessToken);
                }
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                console.log("Token atualizado com sucesso!");
                // Tenta refazer a sincronização recarregando a página
                window.location.reload();
            } else {
                throw new Error("Falha ao atualizar token");
            }
        } catch (err) {
            console.warn("Sessão expirou. Novo login necessário.", err);
            redirectToLogin();
        }
    }

    // Passo 1 / Passo 4: Redirecionamento para a Central de Contas
    function redirectToLogin() {
        localStorage.clear();
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `${config.accountUrl}/#login?redirect=${currentUrl}`;
    }
});

// Passo 3: Chamadas Autenticadas à API
// Função utilitária global para fazer requisições autenticadas se necessário
async function fetchUserProfile() {
    const token = localStorage.getItem('auth_token');
    const config = window.SSO_CONFIG || { apiUrl: 'https://api.mysite.dev.br' };

    const response = await fetch(`${config.apiUrl}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        // Token expirado - Tenta renovar
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${config.apiUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                    const result = await refreshResponse.json();
                    const newAccessToken = result.data?.accessToken || result.data?.token || result.accessToken;
                    const newRefreshToken = result.data?.refreshToken || result.refreshToken;
                    
                    localStorage.setItem('auth_token', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refresh_token', newRefreshToken);
                    }
                    
                    // Refaz a chamada com o novo token
                    const retryResponse = await fetch(`${config.apiUrl}/auth/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${newAccessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    return await retryResponse.json();
                }
            } catch (err) {
                console.error("Falha no refresh em fetchUserProfile:", err);
            }
        }
        localStorage.clear();
        const currentUrl = encodeURIComponent(window.location.href);
        const accountUrl = config.accountUrl || 'https://accounts.mysite.dev.br';
        window.location.href = `${accountUrl}/#login?redirect=${currentUrl}`;
        return null;
    }

    return await response.json();
}
