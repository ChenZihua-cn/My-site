#!/bin/bash
set -e  # 遇到错误立即退出

# ==================== 配置区 ====================
PROJECT_DIR="/home/azureuser/My-site"          # 项目根目录（包含 package.json）
BUILD_OUTPUT="dist"                            # npm run build 生成的目录名
DEPLOY_ROOT="/var/www/luv2u"                   # Nginx 实际使用的目录（软链接指向）
RELEASES_DIR="/var/www/releases/luv2u"         # 存放历史发布版本
CURRENT_LINK="${DEPLOY_ROOT}"                  # 当前软链接路径
NGINX_SERVICE="nginx"                          # Nginx 服务名

# 保留最近的发布版本数（含当前）
KEEP_RELEASES=5

# ==================== 脚本开始 ====================
# 1. 进入项目目录
cd "$PROJECT_DIR" || { echo "项目目录不存在: $PROJECT_DIR"; exit 1; }

# 2. 拉取最新代码（若使用 Git）
if [ -d ".git" ]; then
    echo "拉取最新代码..."
    git pull || { echo "Git pull 失败"; exit 1; }
fi

# 3. 安装依赖（可选，根据实际情况启用）
echo "安装依赖..."
npm install || { echo "npm install 失败"; exit 1; }

# 4. 构建项目
echo "构建项目..."
npm run build || { echo "构建失败"; exit 1; }

# 5. 检查构建产物
if [ ! -d "$BUILD_OUTPUT" ]; then
    echo "构建目录 $BUILD_OUTPUT 不存在"
    exit 1
fi

# 6. 创建带时间戳的发布目录
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/build_${TIMESTAMP}"
sudo mkdir -p "$RELEASES_DIR"
sudo cp -r "$BUILD_OUTPUT" "$RELEASE_DIR"
echo "已复制构建产物到 $RELEASE_DIR"

# 7. 更新软链接（原子操作）
echo "切换软链接到新版本..."
sudo ln -snf "$RELEASE_DIR" "$CURRENT_LINK"
echo "当前版本指向 $RELEASE_DIR"

# 8. 重载 Nginx（平滑生效）
echo "重载 Nginx..."
sudo systemctl reload "$NGINX_SERVICE" || {
    echo "Nginx 重载失败，请检查配置"
    exit 1
}

# 9. 清理旧版本（保留最近 KEEP_RELEASES 个）
echo "清理旧版本..."
cd "$RELEASES_DIR" || exit
ALL_RELEASES=( $(ls -d build_* 2>/dev/null | sort -r) )
TOTAL=${#ALL_RELEASES[@]}
if [ $TOTAL -gt $KEEP_RELEASES ]; then
    DELETE_COUNT=$((TOTAL - KEEP_RELEASES))
    echo "   保留 ${KEEP_RELEASES} 个版本，删除 ${DELETE_COUNT} 个旧版本..."
    for ((i=KEEP_RELEASES; i<TOTAL; i++)); do
        sudo rm -rf "${ALL_RELEASES[i]}"
        echo "   已删除 ${ALL_RELEASES[i]}"
    done
else
    echo "   当前版本数 ${TOTAL}，无需清理"
fi

echo "部署完成！当前版本: $RELEASE_DIR"