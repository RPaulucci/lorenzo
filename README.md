# ⚡ Reflexo Matemático - Monolito MVC

Este é um aplicativo monolítico MVC construído com **Node.js**, **Express**, **MySQL** e **Sequelize** para ajudar as pessoas (incluindo crianças) a exercitarem cálculos matemáticos de cabeça e desenvolverem reflexos visuais rápidos.

O projeto utiliza os princípios **SOLID**, **Clean Code** e **Programação Orientada a Objetos (POO)**.

---

## 🚀 Funcionalidades

- **Trilha de Teste Livre (Modo Visitante)**: Qualquer usuário pode experimentar os jogos matemáticos e treinar sem a necessidade de criar conta ou fazer login de imediato.
- **Autenticação Unificada (SSO)**: Integração com o portal central `accounts.mysite.dev.br`. A autenticação local foi desativada em prol do login único e seguro.
- **Salvamento Automático Pós-Login**: Resultados obtidos no modo visitante são salvos automaticamente no perfil do usuário assim que ele efetuar o login ao final da trilha de teste.
- **4 Operações Fundamentais**:
  - **Soma (`+`)**
  - **Subtração (`-`)**
  - **Multiplicação (`×`)**
  - **Divisão (`÷`)**
- **10 Níveis de Dificuldade por Operação**: A amplitude dos números aumenta à medida que a dificuldade avança.
- **Tempo Limite Decrescente**: O tempo para resolução diminui conforme a dificuldade aumenta (de 15 segundos no Nível 1 até 2 segundos no Nível 10).
- **Treinamento de 10 Questões por Sessão**: Sessões rápidas e focadas com feedback visual imediato (respostas brilham em **verde** ou **vermelho**).
- **Painel de Estatísticas & Histórico**: Visualização de acertos, médias e registros detalhados das sessões no MySQL (exclusivo para usuários logados).

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js (Express), Sequelize ORM, Express Session.
- **Banco de Dados**: MySQL (mysql2).
- **Frontend**: HTML5, Vanilla CSS, EJS Templates, Javascript (ES6+).
- **Segurança & Redes**: Integração com rede docker externa (`repo-services_ms-network`) para comunicação com o proxy reverso Traefik central da VM. Sem portas expostas diretamente para o host público (apenas via Traefik 80/443).

---

## ⚙️ Instalação e Configuração

### Método 1: Utilizando Docker & Docker Compose (Recomendado para Produção)
O projeto está configurado para integrar-se ao proxy reverso **Traefik** central rodando na VM através da rede docker externa `repo-services_ms-network`.

1. Certifique-se de que possui o **Docker** e o **Docker Compose** instalados na VM.
2. Certifique-se de que a rede docker do Traefik (`repo-services_ms-network`) já foi criada na VM.
3. Crie e configure o arquivo `.env` na raiz do projeto a partir do modelo:
   ```bash
   cp .env.example .env
   ```
4. Edite o `.env` e preencha as variáveis de produção (exemplo abaixo):
   ```ini
   PORT=3005
   SESSION_SECRET=sua_chave_de_sessao_super_segura
   
   # Configurações do MySQL Docker
   DOCKER_MYSQL_ROOT_PASSWORD=senha_root_do_banco
   DOCKER_MYSQL_USER=lorenzo_user
   DOCKER_MYSQL_PASSWORD=senha_do_usuario_banco
   
   # Integração SSO e Roteamento
   AUTH_API_BASE_URL=https://api.mysite.dev.br
   ACCOUNT_URL=https://accounts.mysite.dev.br
   DOCKER_APP_HOST=lorenzo.mysite.dev.br
   USE_MOCK_AUTH=false
   ```
5. Suba os containers com build em modo de produção:
   ```bash
   docker compose up -d --build
   ```
6. O app estará acessível em `https://lorenzo.mysite.dev.br` roteado pelo Traefik central.

---

### Método 2: Execução Local Manual (Sem Docker para Desenvolvimento)

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

# Para desenvolvimento local, você pode usar o Mock de autenticação
AUTH_API_BASE_URL=https://api.mysite.dev.br
ACCOUNT_URL=https://accounts.mysite.dev.br
USE_MOCK_AUTH=true
```

#### 3. Criar Banco de Dados MySQL
Antes de rodar o servidor, crie a base de dados no MySQL local:

```sql
CREATE DATABASE IF NOT EXISTS math_reflex_db;
```

#### 4. Instalar as Dependências e Rodar o App

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (com live reload do Nodemon)
npm run dev
```

Acesse o sistema através do navegador: `http://localhost:3005`
