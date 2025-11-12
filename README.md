# NestJS Monorepo Practice

A comprehensive NestJS monorepo project demonstrating best practices and advanced features.

## 🏗️ Project Structure

```
nestjs-practice/
├── apps/
│   ├── api/                 # Main API application
│   └── admin/               # Admin dashboard application
├── libs/
│   ├── shared/              # Shared DTOs, interfaces, utilities
│   ├── database/            # Database entities and configurations
│   └── auth/               # Authentication and authorization
├── docker/                  # Docker initialization scripts
├── docker-compose.yml       # Database services
├── docker-compose.apps.yml  # Application services
└── Dockerfile              # Application container
```

## 🚀 Features Implemented

### Core NestJS Concepts
- ✅ **Modular Architecture**: Separate modules for different features
- ✅ **Controllers**: RESTful API endpoints
- ✅ **Services**: Business logic implementation
- ✅ **Dependency Injection**: Proper DI patterns

### Advanced Features
- ✅ **Guards**: JWT authentication and role-based authorization
- ✅ **Pipes**: Custom validation with class-validator
- ✅ **Interceptors**: Request logging and response transformation
- ✅ **Exception Filters**: Centralized error handling

### Database Integration
- ✅ **TypeORM**: MySQL integration with entities
- ✅ **Mongoose**: MongoDB integration
- ✅ **Redis**: Caching and session management

### Configuration & Deployment
- ✅ **@nestjs/config**: Environment-based configuration
- ✅ **Docker**: Containerized applications and databases
- ✅ **Monorepo**: Shared libraries and cross-app references

## 📋 Quick Start

### Prerequisites
- Node.js 16+
- Docker & Docker Compose
- MySQL, MongoDB, Redis (or use Docker)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd nestjs-practice
npm install --legacy-peer-deps
```

2. **Start databases with Docker**
```bash
docker-compose up -d mysql mongodb redis
```

3. **Start applications**
```bash
# Start API application
npm run start:api:dev

# Start Admin application (in another terminal)
npm run start:admin:dev
```

### Docker Deployment

1. **Start all services**
```bash
# Start databases
docker-compose up -d

# Start applications
docker-compose -f docker-compose.apps.yml up --build
```

## 🌐 API Endpoints

### API Application (http://localhost:3000)
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/posts` - Get all posts
- `POST /api/v1/posts` - Create post
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Admin Application (http://localhost:3001)
- `GET /admin/v1/users` - Admin user management
- `GET /admin/v1/users/stats` - User statistics
- `GET /admin/v1/reports/users` - User reports (admin only)
- `GET /admin/v1/reports/activity` - Activity reports (admin only)

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nestjs_user
DB_PASSWORD=nestjs_password
DB_DATABASE=nestjs_db

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nestjs_practice

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

## 🏛️ Monorepo Benefits

### Shared Libraries
- **@nestjs-practice/shared**: Common DTOs, interfaces, pipes, interceptors
- **@nestjs-practice/database**: Database entities and configurations
- **@nestjs-practice/auth**: Authentication logic and guards

### Cross-App References
- Both API and Admin apps use shared libraries
- Consistent data models across applications
- Reusable authentication and validation logic
- Centralized database configuration

### Development Benefits
- Single dependency management
- Shared type definitions
- Consistent code style and patterns
- Easy refactoring across applications

## 📊 Database Schema

### MySQL Tables
- `users`: User accounts with roles
- `posts`: Blog posts with author relationships

### MongoDB Collections
- `users`: User profiles and preferences
- `posts`: Content with full-text search

### Redis Usage
- Session storage
- API response caching
- Rate limiting

## 🔒 Authentication & Authorization

### JWT Authentication
- Login endpoint returns JWT token
- Token-based API access
- Automatic token refresh

### Role-Based Access Control
- `admin`: Full access to all resources
- `user`: Limited access to own resources
- `moderator`: Content management access

### Guards Implementation
- `JwtAuthGuard`: Protects routes with JWT
- `RolesGuard`: Enforces role-based permissions

## 🛠️ Development Scripts

```bash
# Development
npm run start:dev              # Start all apps in dev mode
npm run start:api:dev          # Start API app only
npm run start:admin:dev        # Start Admin app only

# Building
npm run build                   # Build all apps
npm run build:api              # Build API app only
npm run build:admin            # Build Admin app only

# Testing
npm run test                   # Run all tests
npm run test:e2e              # Run e2e tests
npm run test:cov              # Run tests with coverage

# Linting
npm run lint                   # Lint all code
npm run format                 # Format code with Prettier
```

## 📝 API Documentation

### Request/Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Request successful",
  "data": { ... },
  "timestamp": "2023-12-07T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### Error Handling
Errors are handled globally and return structured responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "errors": ["Email must be valid"]
    }
  ],
  "timestamp": "2023-12-07T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "statusCode": 400
}
```

## 🐳 Docker Services

### Database Services
- **MySQL**: Port 3306, GUI at http://localhost:8080 (phpMyAdmin)
- **MongoDB**: Port 27017, GUI at http://localhost:8082 (Mongo Express)
- **Redis**: Port 6379, GUI at http://localhost:8081 (Redis Commander)

### Application Services
- **API App**: Port 3000
- **Admin App**: Port 3001

## 🔄 CI/CD Pipeline

The project includes Docker configurations for:
- Development environments
- Production deployments
- Database migrations
- Health checks

## 📈 Monitoring & Logging

### Request Logging
All HTTP requests are logged with:
- Timestamp
- Method and URL
- Response time
- User agent
- IP address

### Health Checks
- `/health` endpoint for application status
- Database connectivity checks
- Redis connection verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- NestJS framework and community
- TypeORM for database ORM
- Docker for containerization
- All contributors and maintainers