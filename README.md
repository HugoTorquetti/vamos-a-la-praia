# Vamos à la Praia API

API Rest em **Node.js (Express)** com **MongoDB (Mongoose)**, **autenticação JWT** e **documentação Swagger**.

## Requisitos

- Node.js 18+ (recomendado 20+)
- MongoDB (local ou remoto)

## Setup

1) Instalar dependências:

```bash
npm install
```

2) Configurar variáveis de ambiente:

- Copie `.env.example` para `.env` e ajuste os valores.

3) Rodar a API:

```bash
npm run dev
```

## Scripts

- `npm start`: inicia a API (modo estático)
- `npm run dev`: inicia com reinício automático ao alterar arquivos (nodemon)

## Endpoints

- `GET /health`: healthcheck
- `POST /auth/register`: cria usuário e retorna JWT
- `POST /auth/login`: login e retorna JWT
- `GET /auth/me`: rota protegida (Bearer JWT)

## Swagger

- `GET /docs`: UI do Swagger

## Deploy (Vercel)

Este repositório já inclui um entrypoint serverless em `api/index.js` e um `vercel.json` roteando todas as rotas para ele.

## Arquitetura (camadas)

- `src/routes`: definição de rotas HTTP
- `src/middleware`: middlewares (auth, errors)
- `src/controllers`: handlers HTTP
- `src/services`: regras de negócio
- `src/models`: modelos do Mongoose
- `src/config`: env e DB
- `src/docs`: especificação OpenAPI (`openapi.yaml`)

# Vamos a la Praia API

Estrutura inicial de uma API REST em **Node.js (Express)** com:

- **MongoDB** via **Mongoose**
- **Autenticação JWT** (register/login + rota protegida)
- **Swagger UI** em `GET /api-docs`
- Arquitetura em camadas: `routes`, `middlewares`, `controllers`, `models`, `services`

## Requisitos

- Node.js 18+ (recomendado)
- MongoDB (local ou cloud)

## Setup

1) Instalar dependências:

```bash
npm install
```

2) Criar `.env` a partir do exemplo:

```bash
copy .env.example .env
```

3) Configurar `MONGODB_URI` e `JWT_SECRET` no `.env`.

## Scripts

- **Start (estático)**:

```bash
npm run start
```

- **Dev (hot reload)**:

```bash
npm run dev
```

## Endpoints

- **Swagger**: `GET /api-docs`
- **Healthcheck**: `GET /api/v1/health`
- **Auth**
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`

### Exemplo de fluxo

1) Registrar:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Hugo\",\"email\":\"hugo@email.com\",\"password\":\"123456\"}"
```

2) Login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"hugo@email.com\",\"password\":\"123456\"}"
```

O retorno inclui `token` (Bearer).

## Deploy (futuro)

O projeto já inclui `api/index.js` e `vercel.json` para facilitar deploy na Vercel como Serverless Function (ajustes podem ser necessários conforme o runtime escolhido).

