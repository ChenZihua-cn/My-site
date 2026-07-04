#!/bin/bash
set -e

PROJECT_DIR="/home/azureuser/My-site"
BUILD_OUTPUT="dist"
DEPLOY_ROOT="/var/www/luv2u"
RELEASES_DIR="/var/www/releases/luv2u"
KEEP_RELEASES=5

cd "$PROJECT_DIR" || exit 1

# 构建
echo "构建项目..."
npm run build || exit 1

# 创建带时间戳的发布目录
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/build_${TIMESTAMP}"
sudo mkdir -p "$RELEASES_DIR"
sudo cp -r "$BUILD_OUTPUT"/* "$RELEASE_DIR/"
echo "✅ 已复制构建产物到 $RELEASE_DIR"

# 关键修复：确保 DEPLOY_ROOT 是软链接
if [ -L "$DEPLOY_ROOT" ]; then
    # 如果已是软链接，直接替换
    sudo ln -snf "$RELEASE_DIR" "$DEPLOY_ROOT"
elif [ -d "$DEPLOY_ROOT" ]; then
    # 如果是目录，先删除再创建软链接
    echo "⚠️ $DEPLOY_ROOT 是目录，正在转换为软链接..."
    sudo rm -rf "$DEPLOY_ROOT"
    sudo ln -s "$RELEASE_DIR" "$DEPLOY_ROOT"
else
    # 不存在，直接创建
    sudo ln -s "$RELEASE_DIR" "$DEPLOY_ROOT"
fi

# 验证软链接
echo "✅ 软链接指向: $(readlink $DEPLOY_ROOT)"

# 重载 Nginx
sudo systemctl reload nginx

# 清理旧版本（保留最近 KEEP_RELEASES 个）
cd "$RELEASES_DIR" || exit
ALL_RELEASES=( $(ls -d build_* 2>/dev/null | sort -r) )
TOTAL=${#ALL_RELEASES[@]}
if [ $TOTAL -gt $KEEP_RELEASES ]; then
    DELETE_COUNT=$((TOTAL - KEEP_RELEASES))
    echo "🧹 删除 ${DELETE_COUNT} 个旧版本..."
    for ((i=KEEP_RELEASES; i<TOTAL; i++)); do
        sudo rm -rf "${ALL_RELEASES[i]}"
        echo "   已删除 ${ALL_RELEASES[i]}"
    done
fi

echo "🎉 部署完成！版本: $RELEASE_DIR"