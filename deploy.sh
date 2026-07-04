#!/bin/bash
set -e

PROJECT_DIR="/home/azureuser/My-site"
BUILD_OUTPUT="dist"
DEPLOY_ROOT="/var/www/luv2u"
RELEASES_DIR="/var/www/releases/luv2u"
KEEP_RELEASES=5
NGINX_USER="www-data"

cd "$PROJECT_DIR" || exit 1

# 拉取最新代码
echo "📦 拉取最新代码..."
git pull || exit 1

# 安装依赖
echo "📦 安装依赖..."
npm ci || exit 1

# 构建
echo "🔨 构建项目..."
npm run build || exit 1

# 验证构建产出
if [ ! -d "$BUILD_OUTPUT" ] || [ -z "$(ls -A "$BUILD_OUTPUT" 2>/dev/null)" ]; then
    echo "❌ 构建产出目录为空或不存在"
    exit 1
fi

# 验证 nginx 配置引用了 DEPLOY_ROOT
if ! sudo grep -qr "$DEPLOY_ROOT" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null; then
    echo "⚠️  nginx 配置中未找到 $DEPLOY_ROOT，请检查 root 指令是否正确！"
    echo "    当前 nginx 完整配置中的 root 指令："
    sudo nginx -T 2>/dev/null | grep -i "root" || true
fi

# 创建带时间戳的发布目录
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/build_${TIMESTAMP}"
sudo mkdir -p "$RELEASES_DIR"
sudo cp -r "$BUILD_OUTPUT"/. "$RELEASE_DIR/"

# 修复权限：确保 nginx 可以读取静态文件
sudo chown -R "$NGINX_USER":"$NGINX_USER" "$RELEASE_DIR"
sudo chmod -R 755 "$RELEASE_DIR"
echo "✅ 已复制构建产物到 $RELEASE_DIR"

# 确保 DEPLOY_ROOT 是软链接
if [ -L "$DEPLOY_ROOT" ]; then
    sudo ln -snf "$RELEASE_DIR" "$DEPLOY_ROOT"
elif [ -d "$DEPLOY_ROOT" ]; then
    echo "⚠️  $DEPLOY_ROOT 是目录，正在转换为软链接..."
    sudo rm -rf "$DEPLOY_ROOT"
    sudo ln -s "$RELEASE_DIR" "$DEPLOY_ROOT"
else
    sudo ln -s "$RELEASE_DIR" "$DEPLOY_ROOT"
fi

# 验证软链接
ACTUAL_LINK=$(readlink "$DEPLOY_ROOT")
echo "✅ 软链接指向: $ACTUAL_LINK"

# 验证 nginx 配置语法，通过后再 reload
echo "🔍 检查 nginx 配置..."
sudo nginx -t || { echo "❌ nginx 配置检查失败，部署中止"; exit 1; }
sudo systemctl reload nginx
echo "✅ nginx 已重载"

# 清理旧版本
cd "$RELEASES_DIR" || exit
OLD_RELEASES=( $(find . -maxdepth 1 -type d -name 'build_*' | sort -r | tail -n +$((KEEP_RELEASES + 1))) )
if [ ${#OLD_RELEASES[@]} -gt 0 ]; then
    echo "🧹 删除 ${#OLD_RELEASES[@]} 个旧版本..."
    for dir in "${OLD_RELEASES[@]}"; do
        sudo rm -rf "$dir"
        echo "   已删除 $dir"
    done
fi

echo "🎉 部署完成！版本: $RELEASE_DIR"