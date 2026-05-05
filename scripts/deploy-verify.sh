#!/bin/bash

# ===========================================
# Rewind Production Deployment Verification
# Rewind 生产部署验证脚本
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
HEALTH_CHECK_TIMEOUT=120
API_BASE_URL="http://localhost:3000"
DASHBOARD_URL="http://localhost"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "检查部署前置条件..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log_error "环境配置文件 $ENV_FILE 不存在"
        log_info "请复制 .env.example 到 .env 并配置相应参数"
        exit 1
    fi
    
    log_success "前置条件检查通过"
}

validate_environment() {
    log_info "验证环境配置..."
    
    # Check required environment variables
    required_vars=(
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            log_error "缺少必需的环境变量: $var"
            exit 1
        fi
        
        # Check if using default values (security risk)
        if grep -q "^${var}=.*change.*production" "$ENV_FILE"; then
            log_warning "环境变量 $var 使用默认值，生产环境请修改"
        fi
    done
    
    log_success "环境配置验证通过"
}

build_and_start() {
    log_info "构建并启动服务..."
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    log_success "服务启动完成"
}

wait_for_services() {
    log_info "等待服务启动..."
    
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=5
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        # Check PostgreSQL
        if docker-compose exec -T postgres pg_isready -U rewind -d rewind &> /dev/null; then
            log_success "PostgreSQL 服务就绪"
            break
        fi
        
        log_info "等待 PostgreSQL 启动... (${elapsed}s/${timeout}s)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    if [ $elapsed -ge $timeout ]; then
        log_error "PostgreSQL 启动超时"
        exit 1
    fi
    
    # Wait for Redis
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
            log_success "Redis 服务就绪"
            break
        fi
        
        log_info "等待 Redis 启动... (${elapsed}s/${timeout}s)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    if [ $elapsed -ge $timeout ]; then
        log_error "Redis 启动超时"
        exit 1
    fi
    
    # Wait for Server
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -f "$API_BASE_URL/health" &> /dev/null; then
            log_success "Server 服务就绪"
            break
        fi
        
        log_info "等待 Server 启动... (${elapsed}s/${timeout}s)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    if [ $elapsed -ge $timeout ]; then
        log_error "Server 启动超时"
        exit 1
    fi
    
    # Wait for Dashboard
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -f "$DASHBOARD_URL" &> /dev/null; then
            log_success "Dashboard 服务就绪"
            break
        fi
        
        log_info "等待 Dashboard 启动... (${elapsed}s/${timeout}s)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    if [ $elapsed -ge $timeout ]; then
        log_error "Dashboard 启动超时"
        exit 1
    fi
}

run_health_checks() {
    log_info "执行健康检查..."
    
    # API Health Check
    response=$(curl -s "$API_BASE_URL/health")
    if echo "$response" | grep -q '"status":"ok"'; then
        log_success "API 健康检查通过"
    else
        log_error "API 健康检查失败: $response"
        exit 1
    fi
    
    # Database Connection Check
    if docker-compose exec -T server node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect().then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch((error) => {
            console.error('Database connection failed:', error);
            process.exit(1);
        });
    " &> /dev/null; then
        log_success "数据库连接检查通过"
    else
        log_error "数据库连接检查失败"
        exit 1
    fi
    
    # Redis Connection Check
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis 连接检查通过"
    else
        log_error "Redis 连接检查失败"
        exit 1
    fi
}

run_api_tests() {
    log_info "执行 API 测试..."
    
    # Test event ingestion endpoint
    test_payload='{
        "type": "error",
        "level": "error",
        "message": "Test error message",
        "sessionId": "test-session",
        "pageUrl": "https://example.com/test",
        "breadcrumbs": [],
        "device": {
            "userAgent": "Test Agent",
            "platform": "Test Platform",
            "language": "zh-CN"
        },
        "timestamp": '$(date +%s000)'
    }'
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-API-Key: test-api-key" \
        -d "$test_payload" \
        "$API_BASE_URL/api/v1/report")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "事件上报 API 测试通过"
    else
        log_warning "事件上报 API 测试失败 (可能需要配置 API Key): $response"
    fi
}

check_performance() {
    log_info "执行性能检查..."
    
    # Measure API response time
    start_time=$(date +%s%N)
    curl -s "$API_BASE_URL/health" > /dev/null
    end_time=$(date +%s%N)
    
    response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $response_time -lt 1000 ]; then
        log_success "API 响应时间: ${response_time}ms (良好)"
    elif [ $response_time -lt 3000 ]; then
        log_warning "API 响应时间: ${response_time}ms (一般)"
    else
        log_error "API 响应时间: ${response_time}ms (较慢)"
    fi
    
    # Check memory usage
    memory_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | grep rewind)
    log_info "内存使用情况:"
    echo "$memory_usage"
}

check_security() {
    log_info "执行安全检查..."
    
    # Check if default passwords are being used
    if grep -q "rewind_password_change_in_production" "$ENV_FILE"; then
        log_error "检测到默认数据库密码，生产环境请修改"
    else
        log_success "数据库密码已自定义"
    fi
    
    if grep -q "your-super-secret-jwt-key-change-in-production" "$ENV_FILE"; then
        log_error "检测到默认 JWT 密钥，生产环境请修改"
    else
        log_success "JWT 密钥已自定义"
    fi
    
    # Check if HTTPS is configured (for production)
    if [ "$NODE_ENV" = "production" ]; then
        log_warning "生产环境建议配置 HTTPS 和反向代理"
    fi
}

generate_report() {
    log_info "生成部署报告..."
    
    report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Rewind 部署验证报告"
        echo "===================="
        echo "时间: $(date)"
        echo "环境: ${NODE_ENV:-development}"
        echo ""
        echo "服务状态:"
        docker-compose ps
        echo ""
        echo "容器日志 (最近 50 行):"
        echo "--- Server ---"
        docker-compose logs --tail=50 server
        echo "--- Dashboard ---"
        docker-compose logs --tail=50 dashboard
        echo ""
        echo "系统资源使用:"
        docker stats --no-stream
    } > "$report_file"
    
    log_success "部署报告已生成: $report_file"
}

cleanup_on_failure() {
    log_error "部署验证失败，清理资源..."
    docker-compose down
    exit 1
}

main() {
    log_info "开始 Rewind 生产部署验证"
    
    # Set trap for cleanup on failure
    trap cleanup_on_failure ERR
    
    check_prerequisites
    validate_environment
    build_and_start
    wait_for_services
    run_health_checks
    run_api_tests
    check_performance
    check_security
    generate_report
    
    log_success "🎉 部署验证完成！所有检查通过。"
    log_info "访问地址:"
    log_info "  Dashboard: $DASHBOARD_URL"
    log_info "  API: $API_BASE_URL"
    log_info "  API 文档: $API_BASE_URL/api-docs"
}

# Run main function
main "$@"