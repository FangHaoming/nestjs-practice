#!/bin/bash

# Redis 数据恢复脚本
# 用法: ./scripts/restore-redis.sh <backup_file.rdb>

set -e

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

CONTAINER_NAME="nestjs-redis"
REDIS_PASSWORD="redis_password"

# 如果提供了参数，使用指定的备份文件；否则使用最新的备份文件
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    # 查找 backups 目录下最新的 .rdb 文件
    BACKUP_FILE=$(ls -t backups/redis_*.rdb 2>/dev/null | head -n 1)
    
    if [ -z "$BACKUP_FILE" ]; then
        log_error "backups 目录下没有找到 Redis 备份文件"
        exit 1
    fi
    
    log_info "未指定备份文件，使用最新的备份"
fi

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "备份文件 $BACKUP_FILE 不存在"
    exit 1
fi

# 检查容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_error "Redis 容器 $CONTAINER_NAME 未运行"
    log_info "请先启动容器: docker-compose up -d redis"
    exit 1
fi

log_info "开始恢复 Redis 数据..."
log_info "使用备份文件: $BACKUP_FILE"

# 停止 Redis 写入（可选，但更安全）
log_info "停止 Redis 写入操作..."
docker exec "$CONTAINER_NAME" redis-cli --pass "$REDIS_PASSWORD" CONFIG SET save "" > /dev/null 2>&1 || true
docker exec "$CONTAINER_NAME" redis-cli --pass "$REDIS_PASSWORD" CONFIG SET appendonly no > /dev/null 2>&1 || true

# 复制备份文件到容器
log_info "复制备份文件到容器..."
if docker cp "$BACKUP_FILE" "${CONTAINER_NAME}:/data/dump.rdb" > /dev/null 2>&1; then
    log_info "备份文件复制成功"
else
    log_error "备份文件复制失败"
    exit 1
fi

# 重启 Redis 容器以加载新的 RDB 文件
log_info "重启 Redis 容器以加载备份数据..."
if docker restart "$CONTAINER_NAME" > /dev/null 2>&1; then
    # 等待容器启动
    sleep 2
    
    # 检查容器是否正常运行
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_success "Redis 数据恢复成功！"
        log_info "提示: 恢复后 Redis 会使用备份时的数据，当前内存中的数据将被覆盖"
    else
        log_error "Redis 容器启动失败，请检查容器日志"
        exit 1
    fi
else
    log_error "Redis 容器重启失败"
    exit 1
fi

