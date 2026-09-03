# Social Media Backend API

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" />
  <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white" />
</p>

A backend service for a social media application built with Express, MongoDB, Redis, Socket.IO, and AWS S3. The project implements user authentication, profile management, post creation, friend management, message creation, and real-time chat events, with JWT-based access control and file uploads for media assets.

## Overview

This repository is a modular backend API for a social platform. It exposes REST endpoints for authentication, user profiles, posts, friendships, and messaging, while also managing real-time communication through Socket.IO. The app uses Mongoose models for persistence, Redis for socket tracking and token revocation checks, and S3 for uploaded media storage.

## Tech Stack

### Backend

- Node.js — Server runtime for the application.
- Express — HTTP server and route handling.
- TypeScript — Static typing for safer backend development.
- Zod — Request validation for body, params, and file metadata.

### Database

- MongoDB — Primary data store for users, posts, messages, and friendships.
- Mongoose — ODM used for schema creation and MongoDB access.

### Authentication & Security

- JWT — Access tokens are generated and verified for protected routes.
- bcrypt — Password hashing before saving user credentials.
- CORS — Cross-origin access is enabled for browser clients.
- Authorization middleware — Checks decoded token audience and rejects non-admin requests.
- Environment-based configuration — Secrets and service credentials are loaded from environment files.

### Real-Time Communication

- Socket.IO — Real-time event-based communication layer.
- Redis — Tracks active user socket IDs and is checked during connection/authentication flow.

### File & Media Handling

- Multer — Temporary local file handling for uploads before media is transferred to storage.
- AWS S3 — Stores profile images, cover images, and post attachments.
- Presigned URLs — Used to generate temporary asset URLs for protected file access.

### Notifications & Email

- Nodemailer — Sends verification and welcome emails.
- Firebase Admin SDK — Sends push notification payloads to stored FCM tokens.
- Google OAuth — Optionally verifies Google ID tokens for user sign-in.

### Development Tools

- TypeScript compiler — Builds the project to the dist folder.
- Concurrently — Runs TypeScript watch mode and the Node process together in development.
- dotenv — Loads environment-specific configuration.

## Architecture

The project follows a layered backend structure with clear separation between routing, middleware, controllers, services, repositories, and database models.

```text
Client
  │
  ▼
Express App
  │
  ├── CORS + JSON parsing + static uploads
  │
  ▼
Routes
  │
  ▼
Middleware
  │   ├── JWT auth
  │   ├── Admin authorization
  │   └── Zod validation
  │
  ▼
Controller
  │
  ▼
Service
  │
  ├── MongoDB repository layer
  ├── Redis service
  ├── S3 upload service
  └── Firebase / email utilities
  │
  ▼
MongoDB + Redis + AWS S3
```

### Request flow

- HTTP requests enter the Express app.
- Middleware validates the request and authenticates the user when required.
- Controllers call service methods.
- Services use the repository layer and external integrations.
- The response is wrapped in a success response helper with a consistent JSON format.

## Project Structure

```text
src/
├── app.controller.ts                 # App bootstrap, middleware setup, routes, startup
├── main.ts                          # App entrypoint
├── common/
│   ├── enums/                       # User, post, and upload enums
│   ├── exceptions/                  # Custom application errors
│   ├── interfaces/                  # TypeScript interfaces for models
│   ├── services/
│   │   ├── firebase.service.ts      # Firebase notification sender
│   │   ├── redis.service.ts         # Redis helper for sockets, token checks, and cache-like storage
│   │   ├── s3.service.ts            # AWS S3 CRUD and presigned URL helpers
│   │   └── token.service.ts         # JWT generation and verification
│   ├── utils/
│   │   ├── mail/email.service.ts    # Nodemailer transport
│   │   ├── multer/cloude.ts         # Multer storage configuration
│   │   └── security/hash.security.ts # bcrypt hashing helpers
│   └── test/                       # Test folder present in project structure
├── config/
│   └── env.service.ts               # Dotenv configuration and environment accessors
├── database/
│   ├── connection.ts                # MongoDB connection bootstrap
│   ├── models/                      # Mongoose schemas for User, Post, Message, Friends, etc.
│   └── repository/
│       └── base.repository.ts       # Shared Mongo repository wrapper
├── middleware/
│   ├── auth.middelware.ts           # JWT authentication middleware
│   ├── authorization.ts             # Admin-role guard
│   ├── error.middleware.ts          # Global error handler
│   └── validation.middelware.ts     # Zod validation helper
├── modules/
│   ├── auth/                       # Signup, login, email verification, Google OAuth
│   ├── chat/                       # Real-time chat event wiring
│   ├── friends/                    # Friend linking feature
│   ├── messages/                   # Message creation endpoint
│   ├── posts/                      # Post CRUD and attachment logic
│   ├── realtime/                   # Socket.IO gateway setup and auth
│   └── users/                      # Profile and media updates
├── upload/                          # Static upload directory used by local file handling
└── ...
```

## Features

### Authentication

- Email/password signup and login
- JWT-based authentication for protected endpoints
- Email verification flow using a Redis-backed OTP code
- Google ID token authentication via Google OAuth client
- Password hashing before persistence
- User roles with admin-level authorization middleware

### User Management

- Fetch user profile by authenticated user
- Update profile image
- Update cover pictures
- Upload large profile assets through a multipart workflow
- Generate presigned URLs for image access
- Store Firebase Cloud Messaging tokens for push notifications

### Posts

- Create posts with text, tags, visibility, and file attachments
- Fetch a single post by ID
- List posts with pagination support using query parameters (`page`, `limit`)
- Validate that tags reference valid users
- Store uploaded files in AWS S3 under user-specific folders

### Friends

- Add a friend by email
- Upsert friend relationship records in MongoDB

### Messaging

- Create message records with sender and message content
- Message model includes sender ID, receiver ID, room ID, and timestamps

### Real-Time Chat

- Socket.IO connection requires a JWT token
- Active socket IDs are stored in Redis per user
- Server emits a simple test event: `sayHi` / `sayHiBack`
- Disconnection removes the socket from Redis tracking

### Media Storage

- Upload profile and post files to AWS S3
- Media access endpoints for generated asset URLs and file downloads
- Local upload directory is exposed via static middleware under `/upload`

## Authentication Flow

```text
Client
  │
  ▼
POST /api/v1/auth/login or /signup
  │
  ▼
Validate credentials with Zod
  │
  ▼
Hash password / verify hash
  │
  ▼
Generate JWT access + refresh tokens
  │
  ▼
Authorization: Bearer <token>
  │
  ▼
JWT middleware validates token and checks Redis revocation key
  │
  ▼
Protected route executes service logic
```

### JWT details

- Access tokens are signed using the user/admin secret based on role.
- Token audience is set to `User` or `Admin`.
- Access tokens expire after 30 minutes.
- Refresh tokens are generated for the same user and expire after 1 year.
- A revocation key of the form `revokeToken::<userId>::<token>` is checked before allowing access.

### Role handling

- `authorization.ts` checks `req.decode.aud`.
- If the audience is not `Admin`, it throws a forbidden error.
- This is a simple administrative guard and is not a full RBAC system.

## Database

MongoDB is the main persistence layer, accessed through Mongoose models.

### Main models

- User — stores identity, profile media, password hash, role, provider, email verification state, and FCM tokens.
- Post — stores content, attachments, tags, visibility, and soft-delete-related fields.
- Message — stores sender, receiver, message text, room reference, and timestamps.
- Friends — stores a user and a list of their friends.

### Schema notes

- User schemas use a virtual `userName` getter/setter built from first and last name values.
- Posts apply a query filter to hide deleted rows unless admin query is explicitly passed.
- Friend records are stored with `$addToSet` semantics to avoid duplicates.

### Important design decisions

- Database access is centralized via a generic repository wrapper.
- Data models are modular and separated by domain.
- The app uses both MongoDB and Redis, which means it is designed as a richer real-time social backend rather than a minimal CRUD service.

## Redis Usage

Redis is used for temporary and live-session state. The main verified uses are:

- OTP storage during email verification: `OTP::<userId>`
- Token revocation checks in the auth middleware
- Active socket tracking: `user:sockets:<userId>`

The Redis service includes helper methods for:

- `set`, `get`, `ttl`, `exists`, `dele`, `keys`
- `addSocket`, `removeSocket`, `getSockets`, `hasSockets`, `removeUser`

This is used to maintain real-time presence tracking and to validate whether a client has been logged out.

## Real-Time / Socket.IO

The project initializes a Socket.IO server attached to the Express HTTP server.

### Connection flow

- Client connects to the Socket.IO server.
- The server runs a custom authentication middleware.
- It reads the JWT from `socket.handshake.auth.token` or `socket.handshake.headers.token`.
- It decodes the token and looks up the user in MongoDB.
- The user is attached to `socket.data`.
- The socket ID is stored in Redis under the user key.

### Implemented events

The active event currently registered in the code is:

- `sayHi` → server responds with `sayHiBack`

Example server behavior:

```ts
socket.on("sayHi", (data) => {
  socket.emit("sayHiBack", { message: "Hello from server" });
});
```

### Disconnect handling

On disconnect:

- the socket ID is removed from Redis for that user
- if no remaining socket connection exists, the server emits `offline_user` with the user ID

## API Overview

Base URL: `http://localhost:<PORT>/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | No | Logs in a user with email and password. |
| POST | `/api/v1/auth/signup` | No | Registers a new user. Accepts a profile image upload as `image`. |
| PUT | `/api/v1/auth/verfiyEmail` | No | Verifies the email with an OTP code. |
| POST | `/api/v1/auth/google` | No | Verifies and processes a Google ID token. |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/users/user-profile` | Yes | Returns the current authenticated user's profile. |
| PATCH | `/api/v1/users/update-profile` | Yes | Updates the profile image. |
| PATCH | `/api/v1/users/update-profile-BigAsset` | Yes | Updates a profile image using a large asset flow. |
| PATCH | `/api/v1/users/update-cover-pictures` | Yes | Uploads cover images. |
| PATCH | `/api/v1/users/update-profile-presigned-url` | Yes | Generates a presigned URL and stores the key on the user profile. |
| POST | `/api/v1/users/notifications` | Yes | Stores an FCM token and sends a welcome notification. |

### Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/posts/create` | Yes | Creates a new post with attachments, tags, and visibility. |
| GET | `/api/v1/posts/post/:id` | Yes | Gets one post by ID. |
| GET | `/api/v1/posts` | Yes | Lists posts with pagination via `page` and `limit` query params. |
| PUT | `/api/v1/posts/updatePost/:id` | Yes | Updates an owned post. |

### Messages

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/messages/create` | Yes | Creates a message record. |

### Friends

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/friends/addFriend` | Yes | Adds a friend based on the target user's email. |

### Asset endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/image_profile/*path` | No | Streams an S3 asset by key. |
| GET | `/image_profile_presigned/*path` | No | Returns a presigned asset URL. |

## Request Validation & Error Handling

Validation is implemented with Zod and a middleware wrapper.

- `ValidationSchema(...)` checks configured keys like `body`, `params`, and `file`.
- Uploaded `req.file` and `req.files` are attached to `req.body` before validation.
- Validation errors are wrapped in a custom `BadRequestEception`.

The global error middleware responds with:

```json
{
  "message": "...",
  "stack": "...",
  "cause": null
}
```

Custom exceptions used by the app include:

- `BadRequestEception` — 400
- `UnauthorizedException` — 401
- `NotFoundException` — 404
- `ForbiddenExcption` — 403
- `ConflictException` — 409

## Security

This backend incorporates several straightforward security mechanisms that are actually implemented:

- Password hashing with bcrypt before database persistence
- JWT verification for protected endpoints
- Token audience checks for role separation
- Redis token revocation checks in the authentication middleware
- CORS configuration for browser access
- Request validation using Zod
- Environment variables for secrets and external services
- Input validation and file-type handling for upload routes

## Environment Variables

The application reads its environment variables from `.env.dev` and `.env.prod` through `dotenv` and `process.env.NODE_ENV`.

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/social_media_App_db
MOOD=dev
SALT=12
JWT_KEY=your_jwt_key
JWT_ADMIN_SIGNATURE=Admin
JWT_USER_SIGNATURE=User
JWT_ADMIN_REFRESH_SIGNATURE=AdminRefresh
JWT_USER_REFRESH_SIGNATURE=UserRefresh
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
BASE_URL=localhost:3000/
REDIS_URL=your_redis_url
GOOGLE_CLIENT_ID=your_google_client_id
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_EXPIRATION_IN=120
```

> The project does not include a `.env.example` file in the repository root. The values above reflect the actual environment keys used by the app.

## Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- Redis instance
- AWS S3 bucket credentials
- Gmail app password or SMTP credentials for email support
- Optional: Google OAuth client ID

### Install

```bash
git clone <repository-url>
cd social_media
npm install
```

### Configure environment

Create the appropriate environment file based on the runtime:

```bash
cp .env.dev .env.dev
# or update the local environment for your setup
```

Then populate the variables listed above.

### Run in development mode

```bash
npm run start:dev
```

This script runs:

```bash
cross-env NODE_ENV=dev concurrently "tsc -w" "node --watch dist/main.js"
```

### Production mode

```bash
npm run start:prod
```

## Example Requests

### Register a user

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -F "userName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=01234567890" \
  -F "password=secret1234" \
  -F "confirmPassword=secret1234" \
  -F "image=@/path/to/profile.jpg"
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secret1234"
  }'
```

### Get profile

```bash
curl -X GET http://localhost:3000/api/v1/users/user-profile \
  -H "Authorization: Bearer <access_token>"
```

### Create a post

```bash
curl -X POST http://localhost:3000/api/v1/posts/create \
  -H "Authorization: Bearer <access_token>" \
  -F "content=Hello from the backend" \
  -F "visibility=public" \
  -F "attachments=@/path/to/image1.jpg" \
  -F "attachments=@/path/to/image2.jpg"
```

## Engineering Highlights

- Modular Express backend using controllers, services, repositories, and models.
- JWT-based authentication and admin authorization guard.
- MongoDB persistence with Mongoose schema modeling.
- Redis-backed real-time connection tracking and token-revocation checks.
- AWS S3 media pipeline for profile and post assets.
- File upload support with Multer and presigned URLs.
- Socket.IO real-time communication layer for a social application.
- Zod validation for API input integrity.
- Centralized error handling and consistent exception classes.

## Future Improvements

The following are sensible enhancements for this project, but they are not currently implemented in the repository:

- Automated tests with unit and integration coverage
- Swagger/OpenAPI documentation
- Dockerization for development and deployment
- CI/CD pipeline configuration
- Refresh-token rotation and secure logout flows
- More complete RBAC and permission management
- Better pagination, filtering, and sorting for users and messages
- Structured logging and monitoring
- Deployment configuration for production servers

## Summary

This project is a real backend service for a social media application with a clear service-oriented architecture, MongoDB persistence, JWT authentication, S3 media support, Redis-backed presence tracking, and Socket.IO chat. It is a practical example of a multi-feature backend API rather than a minimal tutorial app, and it is well-suited for portfolio and technical discussion purposes.
