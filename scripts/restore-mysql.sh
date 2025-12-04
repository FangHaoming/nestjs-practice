#!/bin/bash

# MySQL 数据恢复脚本
# 用法: ./scripts/restore-mysql.sh <backup_file.sql>

set -e

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

CONTAINER_NAME="nestjs-mysql"
DB_NAME="nestjs_db"
DB_USER="root"
DB_PASSWORD="root_password"

# 如果提供了参数，使用指定的备份文件；否则使用最新的备份文件
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    # 查找 backups 目录下最新的 .sql 文件
    BACKUP_FILE=$(ls -t backups/*.sql 2>/dev/null | head -n 1)
    
    if [ -z "$BACKUP_FILE" ]; then
        log_error "backups 目录下没有找到备份文件"
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
if ! docker ps | grep -q $CONTAINER_NAME; then
    log_error "MySQL 容器 $CONTAINER_NAME 未运行"
    log_info "请先启动容器: docker-compose up -d mysql"
    exit 1
fi

log_info "开始恢复数据库..."
log_info "使用备份文件: $BACKUP_FILE"
log_info "恢复数据库: $DB_NAME"

# 方法1: 直接通过管道恢复（推荐）
docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $BACKUP_FILE

if [ $? -eq 0 ]; then
    log_success "数据恢复成功！"
else
    log_fail "数据恢复失败！"
    exit 1
fi