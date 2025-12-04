#!/bin/bash

# MongoDB 数据恢复脚本
# 用法: ./scripts/restore-mongodb.sh <backup_file.archive>

set -e

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

CONTAINER_NAME="nestjs-mongodb"

# 如果提供了参数，使用指定的备份文件；否则使用最新的备份文件
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    # 查找 backups 目录下最新的 .archive 文件
    BACKUP_FILE=$(ls -t backups/mongodb_*.archive 2>/dev/null | head -n 1)
    
    if [ -z "$BACKUP_FILE" ]; then
        log_error "backups 目录下没有找到 MongoDB 备份文件"
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
    log_error "MongoDB 容器 $CONTAINER_NAME 未运行"
    log_info "请先启动容器: docker-compose up -d mongodb"
    exit 1
fi

log_info "开始恢复 MongoDB 数据..."
log_info "使用备份文件: $BACKUP_FILE"

# 警告：恢复操作会覆盖现有数据
log_warn "警告: 此操作将覆盖 MongoDB 中的现有数据！"
read -p "确认要继续吗？(yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    log_info "操作已取消"
    exit 0
fi

# 方法1: 通过管道恢复（推荐）
log_info "正在恢复数据..."
if docker exec -i "$CONTAINER_NAME" mongorestore --archive < "$BACKUP_FILE" > /dev/null 2>&1; then
    log_success "MongoDB 数据恢复成功！"
else
    log_error "MongoDB 数据恢复失败！"
    log_info "提示: 请检查备份文件格式是否正确，或查看容器日志获取详细错误信息"
    exit 1
fi

