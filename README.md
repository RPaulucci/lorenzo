# ⚡ Reflexo Matemático - Monolito MVC

Este é um aplicativo monolítico MVC construído com **Node.js**, **Express**, **MySQL** e **Sequelize** para ajudar as pessoas (incluindo crianças) a exercitarem cálculos matemáticos de cabeça e desenvolverem reflexos visuais rápidos.

O projeto utiliza os princípios **SOLID**, **Clean Code** e **Programação Orientada a Objetos (POO)**.

---

## 🚀 Funcionalidades

- **Autenticação e Perfil de Usuário Integrados**: Comunicação direta com a API externa no domínio `mysite.dev.br` com um fallback seguro de Mock local para desenvolvimento.
- **4 Operações Fundamentais**:
  - **Soma (`+`)**
  - **Subtração (`-`)**
  - **Multiplicação (`×`)**
  - **Divisão (`÷`)**
- **10 Níveis de Dificuldade por Operação**: A amplitude dos números aumenta à medida que a dificuldade avança.
- **Tempo Limite Decrescente**: O tempo para resolução diminui conforme a dificuldade aumenta (de 15 segundos no Nível 1 até 2 segundos no Nível 10).
- **Treinamento de 10 Questões por Sessão**: Sessões rápidas e focadas.
- **Feedback Visual Imediato**: Alternativas corretas brilham em **verde** e incorretas em **vermelho** por 2 segundos antes de passar à próxima questão.
- **Painel de Estatísticas**: Gráficos e dados de acertos, sessões concluídas e tempo de resposta.
- **Histórico de Treino**: Registros detalhados de sessões salvas no MySQL.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express, Sequelize ORM
- **Banco de Dados**: MySQL (mysql2)
- **Frontend**: HTML5, Vanilla CSS, EJS Templates, Javascript (ES6+)
- **Estética**: Design Dark Mode moderno, efeitos de vidro (glassmorphism), animações de feedback interativas.

---

## 📁 Estrutura do Projeto

```text
/src
  /config
    database.js      # Conexão com o Sequelize
  /controllers
    AuthController.js       # Controle de logins e logout
    DashboardController.js  # Controle da página inicial do usuário e estatísticas
    GameController.js       # Controle do treino matemático e gravação dos scores
  /middlewares
    authMiddleware.js       # Proteção de rotas autenticadas
  /models
    index.js         # Ponto de entrada de sincronização e inicialização do Sequelize
    TrainingSession.js # Modelo de dados da sessão de treino no banco MySQL
  /public
    /css
      style.css      # Estilização completa e responsiva do app
  /services
    AuthService.js   # Integração com API mysite.dev.br (Design Pattern Factory & Strategy)
    GameService.js   # Lógica geradora de operações matemáticas e níveis de dificuldade
  /views
    /layouts
      header.ejs     # Cabeçalho global
      footer.ejs     # Rodapé global
    /pages
      login.ejs      # Tela de login
      dashboard.ejs  # Tela principal e progresso
      game.ejs       # Tela do treino matemático (game arena)
  app.js             # Inicialização e roteamento do Express
.env                 # Variáveis de ambiente
package.json         # Dependências do Node.js
```

---

## ⚙️ Instalação e Configuração

### Método 1: Utilizando Docker & Docker Compose (Recomendado)
O projeto está configurado com **Docker Compose** contendo o banco de dados MySQL, o app Node.js (na porta **3005**) e o proxy reverso **Traefik** com HTTPS automático via Let's Encrypt para o subdomínio `lorenzo.mysite.dev.br`.

1. Certifique-se de que possui o **Docker** e o **Docker Compose** instalados.
2. Certifique-se de que os apontamentos DNS de `lorenzo.mysite.dev.br` estejam apontando para a sua máquina ou configure um redirecionamento local no `/etc/hosts`:
   ```text
   127.0.0.1 lorenzo.mysite.dev.br
   ```
3. Inicialize os serviços:
   ```bash
   docker compose up -d --build
   ```
4. Acesse o aplicativo via HTTPS: `https://lorenzo.mysite.dev.br` ou acesse diretamente na porta mapeada `http://localhost:3005`.

---

### Método 2: Execução Local Manual (Sem Docker)

#### 1. Requisitos
- **Node.js** v18 ou superior
- **MySQL Server** ativo localmente

#### 2. Configurar Variáveis de Ambiente
Edite as credenciais no arquivo `.env` localizado na raiz do projeto:

```ini
PORT=3005
SESSION_SECRET=math_reflex_lorenzo_secret_9988

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=math_reflex_db
DB_DIALECT=mysql

AUTH_API_BASE_URL=https://lorenzo.mysite.dev.br
USE_MOCK_AUTH=true
```

#### 3. Criar Banco de Dados MySQL
Antes de rodar o servidor, crie a base de dados no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS math_reflex_db;
```

#### 4. Instalar as Dependências e Rodar o App

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (com live reload do Nodemon)
npm run dev

# Executar em modo de produção
npm start
```

Acesse o sistema através do navegador: `http://localhost:3005`
