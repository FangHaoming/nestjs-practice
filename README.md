# NestJS Monorepo Practice

一个全面的 NestJS monorepo 项目，展示了最佳实践和高级特性。

## 📋 目录

- [项目结构](#项目结构)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [配置说明](#配置说明)
- [开发指南](#开发指南)
- [Docker 部署](#docker-部署)
- [项目架构](#项目架构)

## 🏗️ 项目结构

```
nestjs-practice/
├── apps/                      # 应用程序目录
│   ├── api/                   # API 应用 (端口 3000)
│   │   ├── src/
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── users/        # 用户管理模块
│   │   │   ├── posts/        # 文章管理模块
│   │   │   ├── api.module.ts
│   │   │   └── main.ts
│   │   └── test/             # E2E 测试
│   └── admin/                # 管理后台应用 (端口 3001)
│       ├── src/
│       │   ├── users/        # 用户管理模块
│       │   ├── reports/     # 报表模块
│       │   ├── admin.module.ts
│       │   └── main.ts
│       └── test/             # E2E 测试
├── libs/                      # 共享库目录
│   ├── shared/               # 共享代码库
│   │   ├── dto/              # 数据传输对象
│   │   ├── entities/         # 实体定义
│   │   ├── filters/          # 异常过滤器
│   │   ├── interceptors/     # 拦截器
│   │   ├── interfaces/       # 接口定义
│   │   └── pipes/            # 自定义管道
│   ├── database/             # 数据库库
│   │   ├── database.module.ts # MySQL/TypeORM 配置
│   │   ├── mongo.module.ts   # MongoDB/Mongoose 配置
│   │   └── cache.module.ts   # Redis 缓存配置
│   └── auth/                 # 认证库
│       ├── auth.module.ts    # 认证模块
│       ├── auth.service.ts   # 认证服务
│       ├── guards/           # 守卫 (JWT, Local, Roles)
│       └── strategies/       # Passport 策略
├── docker/                    # Docker 初始化脚本
│   ├── mysql/                # MySQL 初始化脚本
│   └── mongodb/              # MongoDB 初始化脚本
├── docker-compose.yml        # 数据库服务配置
├── docker-compose.apps.yml   # 应用服务配置
└── package.json              # 项目依赖配置
```

## ✨ 功能特性

### 核心 NestJS 概念
- ✅ **模块化架构**: 不同功能的独立模块
- ✅ **控制器**: RESTful API 端点
- ✅ **服务**: 业务逻辑实现
- ✅ **依赖注入**: 正确的 DI 模式

### 高级特性
- ✅ **守卫 (Guards)**: JWT 认证和基于角色的授权
- ✅ **管道 (Pipes)**: 使用 class-validator 的自定义验证
- ✅ **拦截器 (Interceptors)**: 请求日志和响应转换
- ✅ **异常过滤器 (Exception Filters)**: 集中式错误处理

### 数据库集成
- ✅ **TypeORM**: MySQL 集成和实体管理
- ✅ **Mongoose**: MongoDB 集成
- ✅ **Redis**: 缓存和会话管理

### 配置与部署
- ✅ **@nestjs/config**: 基于环境的配置管理
- ✅ **Docker**: 容器化应用和数据库
- ✅ **Monorepo**: 共享库和跨应用引用
- ✅ **Swagger**: API 文档自动生成

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- Yarn 或 npm
- Docker & Docker Compose (可选，用于数据库)

### 安装步骤

1. **克隆项目并安装依赖**

```bash
git clone <repository-url>
cd nestjs-practice
yarn install
# 或使用 npm
npm install
```

2. **配置环境变量**

```bash
cp .env.example .env
# 根据需要修改 .env 文件中的配置
```

3. **启动数据库服务 (使用 Docker)**

```bash
docker-compose up -d mysql mongodb redis
```

或者手动安装并配置 MySQL、MongoDB 和 Redis。

4. **构建共享库**

```bash
yarn build:libs
```

5. **启动应用**

```bash
# 启动 API 应用 (开发模式)
yarn start:api:dev

# 启动 Admin 应用 (开发模式，需要新终端)
yarn start:admin:dev
```

应用启动后：
- API 应用: http://localhost:3000
- Admin 应用: http://localhost:3001
- API 健康检查: http://localhost:3000/api/v1/health
- Admin 健康检查: http://localhost:3001/admin/v1/health

## 📚 API 文档

### API 应用端点 (http://localhost:3000/api/v1)

#### 认证相关
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/profile` - 获取当前用户信息 (需要 JWT)

#### 用户管理
- `GET /users` - 获取所有用户 (需要 admin 角色)
- `POST /users` - 创建用户 (需要 admin 角色)
- `GET /users/profile` - 获取当前用户资料
- `GET /users/:id` - 获取指定用户 (需要 admin 角色)
- `PATCH /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户 (需要 admin 角色)

#### 文章管理
- `GET /posts` - 获取所有已发布文章 (需要 JWT)
- `POST /posts` - 创建文章 (需要 JWT)
- `GET /posts/drafts` - 获取当前用户的草稿 (需要 JWT)
- `GET /posts/:id` - 获取指定文章 (需要 JWT)
- `PATCH /posts/:id` - 更新文章 (需要 JWT)
- `DELETE /posts/:id` - 删除文章 (需要 JWT)
- `PATCH /posts/:id/publish` - 发布文章 (需要 JWT)

### Admin 应用端点 (http://localhost:3001/admin/v1)

#### 用户管理
- `GET /users` - 获取所有用户 (需要 JWT)
- `GET /users/stats` - 获取用户统计信息 (需要 JWT)
- `GET /users/:id` - 获取指定用户详情 (需要 JWT)

#### 报表管理
- `GET /reports/users` - 生成用户报表 (需要 admin 角色)
- `GET /reports/activity` - 生成活动报表 (需要 admin 角色)

### API 响应格式

所有 API 响应遵循统一格式：

**成功响应:**
```json
{
  "success": true,
  "message": "Request successful",
  "data": { ... },
  "timestamp": "2024-12-07T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

**错误响应:**
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
  "timestamp": "2024-12-07T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "statusCode": 400
}
```

## ⚙️ 配置说明

### 环境变量

项目使用 `.env` 文件进行配置管理。复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
# 应用配置
NODE_ENV=development
PORT=3000

# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nestjs_user
DB_PASSWORD=nestjs_password
DB_DATABASE=nestjs_db

# MongoDB 配置
MONGODB_URI=mongodb://admin:admin_password@localhost:27017/nestjs_practice?authSource=admin

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

### 数据库配置

#### MySQL (TypeORM)
- 默认端口: 3306
- 数据库名: nestjs_db
- 用户: nestjs_user

#### MongoDB (Mongoose)
- 默认端口: 27017
- 数据库名: nestjs_practice
- 管理员用户: admin

#### Redis
- 默认端口: 6379
- 密码: redis_password

## 🏛️ 项目架构

### Monorepo 优势

#### 共享库
- **@nestjs-practice/shared**: 通用 DTO、接口、管道、拦截器
- **@nestjs-practice/database**: 数据库实体和配置
- **@nestjs-practice/auth**: 认证逻辑和守卫

#### 跨应用引用
- API 和 Admin 应用都使用共享库
- 跨应用一致的数据模型
- 可复用的认证和验证逻辑
- 集中式数据库配置

#### 开发优势
- 单一依赖管理
- 共享类型定义
- 一致的代码风格和模式
- 跨应用轻松重构

### 认证与授权

#### JWT 认证
- 登录端点返回 JWT token
- 基于 token 的 API 访问
- Token 自动刷新机制

#### 基于角色的访问控制 (RBAC)
- `admin`: 对所有资源的完全访问权限
- `user`: 对自有资源的有限访问权限
- `moderator`: 内容管理访问权限

#### 守卫实现
- `JwtAuthGuard`: 使用 JWT 保护路由
- `RolesGuard`: 强制执行基于角色的权限
- `LocalAuthGuard`: 本地认证策略

### 数据库架构

#### MySQL 表结构
- `users`: 用户账户和角色信息
- `posts`: 博客文章和作者关系

#### MongoDB 集合
- `users`: 用户配置和偏好设置
- `posts`: 支持全文搜索的内容

#### Redis 使用
- 会话存储
- API 响应缓存
- 速率限制

## 🛠️ 开发指南

### 开发脚本

```bash
# 开发模式
yarn dev:libs               # 监听并构建共享库
yarn dev:api                # 仅启动 API 应用
yarn dev:admin              # 仅启动 Admin 应用

# 构建
yarn build                  # 构建所有应用和库
yarn build:libs             # 仅构建共享库
yarn build:api              # 仅构建 API 应用
yarn build:admin            # 仅构建 Admin 应用

# 测试
yarn test                   # 运行所有单元测试
yarn test:watch             # 监听模式运行测试
yarn test:cov               # 运行测试并生成覆盖率报告
yarn test:e2e:api           # 运行 API 应用的 E2E 测试
yarn test:e2e:admin         # 运行 Admin 应用的 E2E 测试

# 代码质量
yarn lint                   # 检查代码规范
yarn format                 # 使用 Prettier 格式化代码
```

### 代码结构规范

- **模块**: 每个功能模块都有独立的模块文件
- **控制器**: 处理 HTTP 请求和响应
- **服务**: 包含业务逻辑
- **DTO**: 数据传输对象，用于验证和类型安全
- **实体**: 数据库模型定义

### 添加新功能

1. 在相应的应用目录下创建新模块
2. 在 `libs/shared` 中添加共享的 DTO 和接口
3. 在模块中注册服务和控制器
4. 添加相应的测试文件
5. 更新 API 文档

## 🐳 Docker 部署

### 数据库服务

使用 Docker Compose 启动所有数据库服务：

```bash
docker-compose up -d
```

这将启动：
- **MySQL**: 端口 3306
- **MongoDB**: 端口 27017
- **Redis**: 端口 6379

### 应用服务

使用 Docker Compose 启动应用服务：

```bash
# 构建并启动所有服务（数据库 + 应用）
docker-compose -f docker-compose.yml -f docker-compose.apps.yml up --build -d

# 仅启动应用服务（需要先启动数据库）
docker-compose -f docker-compose.apps.yml up -d
```

### Docker 服务端口

- **API 应用**: http://localhost:3000
- **Admin 应用**: http://localhost:3001
- **MySQL**: localhost:3306
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 📊 监控与日志

### 请求日志
所有 HTTP 请求都会记录：
- 时间戳
- 方法和 URL
- 响应时间
- 用户代理
- IP 地址

### 健康检查
- `/api/v1/health` - API 应用健康检查
- `/admin/v1/health` - Admin 应用健康检查

健康检查包括：
- 应用状态
- 数据库连接检查
- Redis 连接验证

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
yarn test

# 运行测试并生成覆盖率报告
yarn test:cov

# 运行 E2E 测试
yarn test:e2e:api
yarn test:e2e:admin
```

### 测试覆盖率

测试覆盖率报告位于 `coverage/` 目录，可以通过浏览器打开 `coverage/lcov-report/index.html` 查看详细报告。

## 📝 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.0, MongoDB 7.0, Redis 7.2
- **ORM**: TypeORM, Mongoose
- **认证**: JWT, Passport
- **验证**: class-validator, class-transformer
- **文档**: Swagger/OpenAPI
- **容器化**: Docker, Docker Compose
- **测试**: Jest
- **代码质量**: ESLint, Prettier

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交规范

- 添加功能: `feat: 添加用户认证功能`
- 修复问题: `fix: 修复登录验证问题`
- 文档更新: `docs: 更新 README`
- 代码重构: `refactor: 重构用户服务`
- 测试相关: `test: 添加用户服务测试`

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [NestJS](https://nestjs.com/) 框架和社区
- [TypeORM](https://typeorm.io/) 数据库 ORM
- [Docker](https://www.docker.com/) 容器化平台
- 所有贡献者和维护者

## 📞 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
