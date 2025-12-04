#!/bin/bash

# 通用工具函数库
# 提供日志输出、颜色输出等通用功能
# 用法: source "$(dirname "$0")/utils.sh" 或 source "./scripts/utils.sh"

# 颜色输出定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
# 用法: log_info "消息内容"
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 警告日志
# 用法: log_warn "消息内容"
log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 错误日志
# 用法: log_error "消息内容"
log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 调试日志（可选，用于调试）
# 用法: log_debug "消息内容"
log_debug() {
    if [ "${DEBUG:-0}" = "1" ]; then
        echo -e "${CYAN}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    fi
}

# 成功消息（不带时间戳，用于简洁的成功提示）
# 用法: log_success "消息内容"
log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

# 失败消息（不带时间戳，用于简洁的失败提示）
# 用法: log_fail "消息内容"
log_fail() {
    echo -e "${RED}❌${NC} $1"
}

