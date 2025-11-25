# API 测试指南

本文档包含所有 API 端点的 curl 命令示例，方便在终端中测试。

## 📋 目录

- [基础配置](#基础配置)
- [认证相关 API](#认证相关-api)
- [用户管理 API](#用户管理-api)
- [文章管理 API](#文章管理-api)
- [完整测试流程](#完整测试流程)

## 🔧 基础配置

### 设置基础 URL
```bash
export BASE_URL="http://localhost:3000/api/v1"
```

### 保存 Token（登录后使用）
```bash
# 登录后，将返回的 access_token 保存到变量
export TOKEN="your_jwt_token_here"
```

---

## 🔐 认证相关 API

### 1. 用户注册
```bash
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }'
```

**示例响应：**
```json
{
  "id": 1,
  "email": "user1@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. 用户登录

> ⚠️ **重要提示**：在登录之前，请先使用注册 API 创建用户。数据库初始化脚本中的示例用户密码是占位符，无法用于实际登录。

```bash
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**示例响应：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user1@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**保存 Token：**
```bash
# 从响应中复制 access_token，然后设置环境变量
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. 获取当前用户信息
```bash
curl -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}"
```

**示例响应：**
```json
{
  "id": 1,
  "email": "user1@example.com",
  "role": "user"
}
```

---

## 👥 用户管理 API

> ⚠️ **注意**：所有用户管理 API 都需要 JWT 认证，部分操作需要 admin 角色。

### 1. 创建用户（需要 admin 角色）
```bash
curl -X POST "${BASE_URL}/users" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user"
  }'
```

### 2. 获取所有用户（需要 admin 角色）
```bash
curl -X GET "${BASE_URL}/users" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. 获取当前用户资料
```bash
curl -X GET "${BASE_URL}/users/profile" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. 根据 ID 获取用户（需要 admin 角色）
```bash
curl -X GET "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. 更新用户信息
```bash
curl -X PATCH "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'
```

### 6. 删除用户（需要 admin 角色）
```bash
curl -X DELETE "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 📝 文章管理 API

> ⚠️ **注意**：所有文章管理 API 都需要 JWT 认证。

### 1. 创建文章
```bash
curl -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一篇文章",
    "content": "这是文章的内容...",
    "excerpt": "文章摘要"
  }'
```

**示例响应：**
```json
{
  "id": 1,
  "title": "我的第一篇文章",
  "content": "这是文章的内容...",
  "excerpt": "文章摘要",
  "isPublished": false,
  "authorId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. 获取所有已发布的文章
```bash
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. 搜索文章（使用查询参数）
```bash
curl -X GET "${BASE_URL}/posts?keyword=文章" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. 搜索文章（使用搜索端点）
```bash
curl -X GET "${BASE_URL}/posts/search?keyword=文章" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. 获取当前用户的草稿
```bash
curl -X GET "${BASE_URL}/posts/drafts" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 6. 根据 ID 获取文章
```bash
curl -X GET "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 7. 更新文章
```bash
curl -X PATCH "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新后的标题",
    "content": "更新后的内容"
  }'
```

### 8. 发布文章
```bash
curl -X PATCH "${BASE_URL}/posts/1/publish" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 9. 删除文章
```bash
curl -X DELETE "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 🏥 健康检查 API

### 1. API 欢迎信息
```bash
curl -X GET "${BASE_URL}/"
```

### 2. 健康检查
```bash
curl -X GET "${BASE_URL}/health"
```

---

## 🚀 完整测试流程

> ⚠️ **重要提示**：在开始测试之前，请确保先注册用户。数据库初始化脚本中的示例用户（如 `user1@example.com`）使用的是占位符密码，无法用于实际登录。

### 步骤 1: 设置环境变量
```bash
export BASE_URL="http://localhost:3000/api/v1"
```

### 步骤 2: 注册用户（必需）
```bash
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "user"
  }'
```

### 步骤 3: 登录获取 Token
```bash
RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

# 提取 token（需要安装 jq）
export TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# 或者手动设置
# export TOKEN="your_token_here"
```

### 步骤 4: 创建文章
```bash
curl -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试文章",
    "content": "这是一篇测试文章的内容",
    "excerpt": "测试摘要"
  }'
```

### 步骤 5: 获取所有文章
```bash
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 步骤 6: 搜索文章
```bash
curl -X GET "${BASE_URL}/posts/search?keyword=测试" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 步骤 7: 发布文章
```bash
curl -X PATCH "${BASE_URL}/posts/1/publish" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 📋 快速测试脚本

创建一个测试脚本 `test-api.sh`：

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "=== 1. 注册用户 ==="
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

echo -e "\n\n=== 2. 登录 ==="
RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.access_token')
echo "Token: $TOKEN"

echo -e "\n\n=== 3. 获取用户信息 ==="
curl -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}"

echo -e "\n\n=== 4. 创建文章 ==="
curl -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一篇文章",
    "content": "这是文章的内容",
    "excerpt": "文章摘要"
  }'

echo -e "\n\n=== 5. 获取所有文章 ==="
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}"

echo -e "\n\n=== 6. 搜索文章 ==="
curl -X GET "${BASE_URL}/posts/search?keyword=文章" \
  -H "Authorization: Bearer ${TOKEN}"

echo -e "\n\n测试完成！"
```

**使用方法：**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🔍 使用 jq 美化 JSON 输出

如果安装了 `jq`，可以在 curl 命令后添加 `| jq` 来美化输出：

```bash
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" | jq
```

---

## ⚠️ 常见错误

### 401 Unauthorized - Invalid credentials
- **最常见原因**：尝试使用数据库初始化脚本中的示例用户登录
  - 解决方案：先使用 `/auth/register` 端点注册新用户，然后再登录
  - 数据库初始化脚本中的用户密码是占位符，无法用于实际登录
- 检查 Token 是否正确
- 确认 Token 是否过期
- 确认请求头格式：`Authorization: Bearer ${TOKEN}`

### 403 Forbidden
- 检查用户角色是否满足要求（某些操作需要 admin 角色）
- 检查是否尝试修改/删除他人的资源

### 404 Not Found
- 检查资源 ID 是否存在
- 检查 API 路径是否正确

### 400 Bad Request
- 检查请求体格式是否正确
- 检查必填字段是否都已提供
- 检查字段验证规则（如邮箱格式、密码长度等）

---

## 📚 更多信息

- Swagger API 文档: http://localhost:3000/api/docs
- 健康检查: http://localhost:3000/api/v1/health

