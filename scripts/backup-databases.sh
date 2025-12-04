#!/bin/bash

# 数据库备份脚本
# 备份 MySQL、MongoDB、Redis，并清理30天前的旧备份
# 用法: 
#   ./scripts/backup-databases.sh                    # 备份所有数据库
#   ./scripts/backup-databases.sh -d mongodb -d redis # 备份指定的数据库

set -e

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

# 配置
BACKUP_DIR="./backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d)

# 容器名称
MYSQL_CONTAINER="nestjs-mysql"
MONGODB_CONTAINER="nestjs-mongodb"
REDIS_CONTAINER="nestjs-redis"

# 数据库配置
MYSQL_USER="root"
MYSQL_PASSWORD="root_password"
MYSQL_DB="nestjs_db"
REDIS_PASSWORD="redis_password"

# 备份选择（默认为空，表示备份所有）
SELECTED_DBS=()

# 显示使用说明
show_usage() {
    echo "用法: $0 [-d DATABASE]..."
    echo ""
    echo "选项:"
    echo "  -d DATABASE    指定要备份的数据库（可多次使用）"
    echo "                可选值: mysql, mongodb, redis"
    echo ""
    echo "示例:"
    echo "  $0                           # 备份所有数据库"
    echo "  $0 -d mongodb -d redis       # 备份 MongoDB 和 Redis"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d)
                if [ -z "$2" ]; then
                    log_error "选项 -d 需要一个参数"
                    show_usage
                    exit 1
                fi
                SELECTED_DBS+=("$2")
                shift 2
                ;;
            *)
                log_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# 验证数据库名称
validate_db() {
    local db=$1
    case "$db" in
        mysql|mongodb|redis)
            return 0
            ;;
        *)
            log_error "无效的数据库名称: $db"
            log_error "支持的数据库: mysql, mongodb, redis"
            return 1
            ;;
    esac
}

# 检查是否应该备份指定数据库
should_backup() {
    local db=$1
    # 如果没有指定数据库，备份所有
    if [ ${#SELECTED_DBS[@]} -eq 0 ]; then
        return 0
    fi
    # 检查是否在选择的列表中
    for selected in "${SELECTED_DBS[@]}"; do
        if [ "$selected" = "$db" ]; then
            return 0
        fi
    done
    return 1
}

# 解析参数
parse_args "$@"

# 验证所有指定的数据库名称
for db in "${SELECTED_DBS[@]}"; do
    if ! validate_db "$db"; then
        exit 1
    fi
done

# 检查备份目录是否存在
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "创建备份目录: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

log_info "开始备份数据库..."
log_info "备份目录: $BACKUP_DIR"
log_info "保留天数: $RETENTION_DAYS 天"
if [ ${#SELECTED_DBS[@]} -eq 0 ]; then
    log_info "备份范围: 所有数据库 (mysql, mongodb, redis)"
else
    log_info "备份范围: ${SELECTED_DBS[*]}"
fi

# 检查容器是否运行
check_container() {
    local container=$1
    if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        log_error "容器 $container 未运行，跳过备份"
        return 1
    fi
    return 0
}

# 备份 MySQL
backup_mysql() {
    if ! check_container "$MYSQL_CONTAINER"; then
        return 1
    fi
    
    log_info "备份 MySQL..."
    local backup_file="${BACKUP_DIR}/mysql_${DATE}.sql"
    
    if docker exec "$MYSQL_CONTAINER" mysqldump -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" > "$backup_file" 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_info "✅ MySQL 备份成功: $backup_file (大小: $size)"
        return 0
    else
        log_error "❌ MySQL 备份失败"
        rm -f "$backup_file"  # 删除可能的部分备份文件
        return 1
    fi
}

# 备份 MongoDB
backup_mongodb() {
    if ! check_container "$MONGODB_CONTAINER"; then
        return 1
    fi
    
    log_info "备份 MongoDB..."
    local backup_file="${BACKUP_DIR}/mongodb_${DATE}.archive"
    
    if docker exec "$MONGODB_CONTAINER" mongodump --archive > "$backup_file" 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_info "✅ MongoDB 备份成功: $backup_file (大小: $size)"
        return 0
    else
        log_error "❌ MongoDB 备份失败"
        rm -f "$backup_file"
        return 1
    fi
}

# 备份 Redis
backup_redis() {
    if ! check_container "$REDIS_CONTAINER"; then
        return 1
    fi
    
    log_info "备份 Redis..."
    local backup_file="${BACKUP_DIR}/redis_${DATE}.rdb"
    
    # 触发 Redis 保存
    if docker exec "$REDIS_CONTAINER" redis-cli --pass "$REDIS_PASSWORD" SAVE > /dev/null 2>&1; then
        # 复制 RDB 文件
        if docker cp "${REDIS_CONTAINER}:/data/dump.rdb" "$backup_file" 2>/dev/null; then
            local size=$(du -h "$backup_file" | cut -f1)
            log_info "✅ Redis 备份成功: $backup_file (大小: $size)"
            return 0
        else
            log_error "❌ Redis 备份失败（复制文件失败）"
            rm -f "$backup_file"
            return 1
        fi
    else
        log_error "❌ Redis 备份失败（SAVE 命令失败）"
        return 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理 $RETENTION_DAYS 天前的旧备份..."
    
    local deleted_count=0
    
    # 清理 MySQL 备份
    if should_backup "mysql"; then
        while IFS= read -r file; do
            if [ -n "$file" ] && [ -f "$file" ]; then
                log_info "删除旧备份: $(basename "$file")"
                rm -f "$file"
                ((deleted_count++))
            fi
        done < <(find "$BACKUP_DIR" -name "mysql_*.sql" -type f -mtime +$RETENTION_DAYS 2>/dev/null)
    fi
    
    # 清理 MongoDB 备份
    if should_backup "mongodb"; then
        while IFS= read -r file; do
            if [ -n "$file" ] && [ -f "$file" ]; then
                log_info "删除旧备份: $(basename "$file")"
                rm -f "$file"
                ((deleted_count++))
            fi
        done < <(find "$BACKUP_DIR" -name "mongodb_*.archive" -type f -mtime +$RETENTION_DAYS 2>/dev/null)
    fi
    
    # 清理 Redis 备份
    if should_backup "redis"; then
        while IFS= read -r file; do
            if [ -n "$file" ] && [ -f "$file" ]; then
                log_info "删除旧备份: $(basename "$file")"
                rm -f "$file"
                ((deleted_count++))
            fi
        done < <(find "$BACKUP_DIR" -name "redis_*.rdb" -type f -mtime +$RETENTION_DAYS 2>/dev/null)
    fi
    
    if [ $deleted_count -gt 0 ]; then
        log_info "✅ 已清理 $deleted_count 个旧备份文件"
    else
        log_info "✅ 没有需要清理的旧备份"
    fi
}

# 显示备份统计
show_backup_stats() {
    log_info "备份统计:"
    
    if should_backup "mysql"; then
        local mysql_count=$(find "$BACKUP_DIR" -name "mysql_*.sql" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "  - MySQL 备份: $mysql_count 个"
    fi
    
    if should_backup "mongodb"; then
        local mongodb_count=$(find "$BACKUP_DIR" -name "mongodb_*.archive" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "  - MongoDB 备份: $mongodb_count 个"
    fi
    
    if should_backup "redis"; then
        local redis_count=$(find "$BACKUP_DIR" -name "redis_*.rdb" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "  - Redis 备份: $redis_count 个"
    fi
    
    # 计算总大小
    if [ ${#SELECTED_DBS[@]} -eq 0 ]; then
        # 备份所有数据库时，显示整个备份目录的大小
        local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
        echo "  - 总大小: $total_size"
    else
        # 只计算选择的数据库类型的备份大小
        local find_args=()
        if should_backup "mysql"; then
            find_args+=(-name "mysql_*.sql")
        fi
        if should_backup "mongodb"; then
            if [ ${#find_args[@]} -gt 0 ]; then
                find_args+=(-o)
            fi
            find_args+=(-name "mongodb_*.archive")
        fi
        if should_backup "redis"; then
            if [ ${#find_args[@]} -gt 0 ]; then
                find_args+=(-o)
            fi
            find_args+=(-name "redis_*.rdb")
        fi
        
        if [ ${#find_args[@]} -gt 0 ]; then
            local total_size=$(find "$BACKUP_DIR" -type f \( "${find_args[@]}" \) -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
            if [ -n "$total_size" ]; then
                echo "  - 总大小: $total_size"
            fi
        fi
    fi
}

# 执行备份
main() {
    local success_count=0
    local fail_count=0
    
    # 备份 MySQL
    if should_backup "mysql"; then
        if backup_mysql; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    fi
    
    # 备份 MongoDB
    if should_backup "mongodb"; then
        if backup_mongodb; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    fi
    
    # 备份 Redis
    if should_backup "redis"; then
        if backup_redis; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    fi
    
    # 清理旧备份
    cleanup_old_backups
    
    # 显示统计
    echo ""
    show_backup_stats
    
    # 总结
    echo ""
    if [ $fail_count -eq 0 ] && [ $success_count -gt 0 ]; then
        log_info "✅ 所有备份完成！成功: $success_count, 失败: $fail_count"
        exit 0
    elif [ $success_count -eq 0 ] && [ $fail_count -eq 0 ]; then
        log_warn "⚠️  没有执行任何备份操作"
        exit 0
    else
        log_warn "⚠️  备份完成，但有部分失败。成功: $success_count, 失败: $fail_count"
        exit 1
    fi
}

# 运行主函数
main

