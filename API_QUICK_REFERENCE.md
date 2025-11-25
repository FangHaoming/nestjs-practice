# API 快速参考

所有 API 端点的 curl 命令快速参考。

## 🔧 前置设置

```bash
export BASE_URL="http://localhost:3000/api/v1"
export TOKEN="your_jwt_token_here"  # 登录后获取
```

---

## 🔐 认证 API

### 注册用户
```bash
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

### 登录
```bash
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 获取当前用户信息
```bash
curl -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 👥 用户管理 API (需要 JWT)

### 创建用户 (需要 admin)
```bash
curl -X POST "${BASE_URL}/users" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"pass123","firstName":"Jane","lastName":"Smith"}'
```

### 获取所有用户 (需要 admin)
```bash
curl -X GET "${BASE_URL}/users" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 获取当前用户资料
```bash
curl -X GET "${BASE_URL}/users/profile" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 根据 ID 获取用户 (需要 admin)
```bash
curl -X GET "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 更新用户
```bash
curl -X PATCH "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated"}'
```

### 删除用户 (需要 admin)
```bash
curl -X DELETE "${BASE_URL}/users/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 📝 文章管理 API (需要 JWT)

### 创建文章
```bash
curl -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"标题","content":"内容","excerpt":"摘要"}'
```

### 获取所有已发布文章
```bash
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 搜索文章 (查询参数)
```bash
curl -X GET "${BASE_URL}/posts?keyword=关键词" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 搜索文章 (搜索端点)
```bash
curl -X GET "${BASE_URL}/posts/search?keyword=关键词" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 获取当前用户的草稿
```bash
curl -X GET "${BASE_URL}/posts/drafts" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 根据 ID 获取文章
```bash
curl -X GET "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 更新文章
```bash
curl -X PATCH "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"新标题","content":"新内容"}'
```

### 发布文章
```bash
curl -X PATCH "${BASE_URL}/posts/1/publish" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 删除文章
```bash
curl -X DELETE "${BASE_URL}/posts/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 🏥 系统 API

### 健康检查
```bash
curl -X GET "${BASE_URL}/health"
```

### API 欢迎信息
```bash
curl -X GET "${BASE_URL}/"
```

---

## 🚀 快速测试流程

```bash
# 1. 设置基础 URL
export BASE_URL="http://localhost:3000/api/v1"

# 2. 注册用户
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"Test","lastName":"User"}'

# 3. 登录并保存 token
export TOKEN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' | jq -r '.access_token')

# 4. 创建文章
curl -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试文章","content":"内容","excerpt":"摘要"}'

# 5. 获取所有文章
curl -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}"

# 6. 搜索文章
curl -X GET "${BASE_URL}/posts/search?keyword=测试" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 💡 提示

- 使用 `| jq` 美化 JSON 输出（需要安装 jq）
- 使用 `-v` 参数查看详细请求信息
- 使用 `-s` 参数静默模式（不显示进度条）

示例：
```bash
curl -s -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" | jq
```

