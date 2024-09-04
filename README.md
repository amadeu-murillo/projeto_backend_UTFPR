# API de Gerenciamento de Usuários

Esta é uma API para gerenciamento e controle de usuários com autenticação JWT. A API permite o gerenciamento de posts e usuários, com funcionalidades para autenticação, criação e gerenciamento de administradores, e muito mais.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- JWT para autenticação
- Swagger para documentação da API

## Estrutura do Projeto

- **app.js**: Configuração do servidor Express e conexão com o MongoDB.
- **models/**: Contém os modelos de dados (User e Post).
- **routes/**: Contém as rotas da API.
  - **login.js**: Rota para login de usuários.
  - **registro.js**: Rota para cadastro de usuários e administradores.
  - **install.js**: Rota para instalação e configuração inicial do banco de dados.
  - **docs.js**: Rota para a documentação da API usando Swagger.
  - **postRoute.js**: Rota para operações relacionadas a posts.
  - **usersRoute.js**: Rota para operações relacionadas a usuários.

## Instalação

Siga as etapas abaixo para configurar e executar o projeto localmente:

1. Clone o repositório:

   ```bash
   git clone https://github.com/amadeu-murillo/projeto_backend_UTFPR.git
