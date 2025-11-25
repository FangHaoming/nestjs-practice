#!/bin/bash

# API 测试脚本
# 使用方法: ./test-api.sh

BASE_URL="http://localhost:3000/api/v1"
EMAIL="test@example.com"
PASSWORD="password123"

echo "=========================================="
echo "NestJS Practice API 测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: jq 未安装，JSON 输出将不会被美化${NC}"
    echo "安装 jq: brew install jq (macOS) 或 apt-get install jq (Linux)"
    USE_JQ=false
else
    USE_JQ=true
fi

echo -e "${BLUE}=== 1. 健康检查 ===${NC}"
curl -s -X GET "${BASE_URL}/health" | ${USE_JQ:+jq} || cat
echo -e "\n"

echo -e "${BLUE}=== 2. 注册用户 ===${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"role\": \"user\"
  }")

echo "$REGISTER_RESPONSE" | ${USE_JQ:+jq} || echo "$REGISTER_RESPONSE"
echo -e "\n"

echo -e "${BLUE}=== 3. 用户登录 ===${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "$LOGIN_RESPONSE" | ${USE_JQ:+jq} || echo "$LOGIN_RESPONSE"

# 提取 token
if [ "$USE_JQ" = true ]; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
else
    # 简单的 token 提取（如果 jq 不可用）
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${YELLOW}警告: 无法提取 token，请手动设置 TOKEN 变量${NC}"
    echo "请从上面的登录响应中复制 access_token"
    exit 1
fi

echo -e "\n${GREEN}Token 已保存: ${TOKEN:0:50}...${NC}\n"

echo -e "${BLUE}=== 4. 获取当前用户信息 ===${NC}"
curl -s -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
echo -e "\n"

echo -e "${BLUE}=== 5. 创建文章 ===${NC}"
CREATE_POST_RESPONSE=$(curl -s -X POST "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一篇文章",
    "content": "这是文章的内容，可以用来测试API功能。",
    "excerpt": "这是文章的摘要"
  }')

echo "$CREATE_POST_RESPONSE" | ${USE_JQ:+jq} || echo "$CREATE_POST_RESPONSE"

# 提取文章 ID
if [ "$USE_JQ" = true ]; then
    POST_ID=$(echo "$CREATE_POST_RESPONSE" | jq -r '.id')
else
    POST_ID=$(echo "$CREATE_POST_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
fi

echo -e "\n"

echo -e "${BLUE}=== 6. 获取所有已发布的文章 ===${NC}"
curl -s -X GET "${BASE_URL}/posts" \
  -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
echo -e "\n"

echo -e "${BLUE}=== 7. 获取当前用户的草稿 ===${NC}"
curl -s -X GET "${BASE_URL}/posts/drafts" \
  -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
echo -e "\n"

if [ ! -z "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    echo -e "${BLUE}=== 8. 根据 ID 获取文章 (ID: ${POST_ID}) ===${NC}"
    curl -s -X GET "${BASE_URL}/posts/${POST_ID}" \
      -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
    echo -e "\n"

    echo -e "${BLUE}=== 9. 更新文章 (ID: ${POST_ID}) ===${NC}"
    curl -s -X PATCH "${BASE_URL}/posts/${POST_ID}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "更新后的标题",
        "content": "更新后的内容"
      }' | ${USE_JQ:+jq} || cat
    echo -e "\n"

    echo -e "${BLUE}=== 10. 发布文章 (ID: ${POST_ID}) ===${NC}"
    curl -s -X PATCH "${BASE_URL}/posts/${POST_ID}/publish" \
      -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
    echo -e "\n"

    echo -e "${BLUE}=== 11. 搜索文章 (关键词: 文章) ===${NC}"
    curl -s -X GET "${BASE_URL}/posts/search?keyword=文章" \
      -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
    echo -e "\n"

    echo -e "${BLUE}=== 12. 删除文章 (ID: ${POST_ID}) ===${NC}"
    curl -s -X DELETE "${BASE_URL}/posts/${POST_ID}" \
      -H "Authorization: Bearer ${TOKEN}" | ${USE_JQ:+jq} || cat
    echo -e "\n"
else
    echo -e "${YELLOW}警告: 无法提取文章 ID，跳过后续测试${NC}\n"
fi

echo -e "${GREEN}=========================================="
echo "测试完成！"
echo "==========================================${NC}"
echo ""
echo "提示:"
echo "  - Token 已保存在变量中，可以继续使用"
echo "  - 查看完整 API 文档: http://localhost:3000/api/docs"
echo "  - 查看详细测试指南: cat API_TESTING.md"

