#!/bin/bash

echo "🔄 [$(date '+%Y-%m-%d %H:%M:%S')] Iniciando despliegue de minecraft-chess..."

# Source nvm to have access to node, npm, and pm2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

cd /mnt/datos/web/chess || {
  echo "❌ No se pudo acceder al directorio del proyecto"
  exit 1
}

echo "🧹 Limpiando cambios locales no confirmados..."
git restore --source=origin/master --staged --worktree . 2>/dev/null || true

echo "📥 Actualizando desde GitHub..."
git pull origin master --allow-unrelated-histories

if [ $? -ne 0 ]; then
  echo "❌ Falló el pull de GitHub"
  exit 1
fi

echo "📦 Instalando/actualizando dependencias..."
npm install --production

echo "🔧 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 no encontrado, instalando..."
    npm install -g pm2
fi

echo "🚀 Configurando y reiniciando aplicación con PM2..."

# Stop the application if running
pm2 stop minecraft-chess 2>/dev/null || true

# Delete old PM2 process
pm2 delete minecraft-chess 2>/dev/null || true

# Start with PM2 ecosystem file or direct command
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start server/server.js --name "minecraft-chess" --env PORT=3000
fi

# Save PM2 configuration
pm2 save

echo "📊 Estado de PM2:"
pm2 status

echo "🔍 Verificando puerto 3000..."
netstat -tlnp 2>/dev/null | grep :3000 || ss -tlnp | grep :3000

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Despliegue completado. Revisa https://chess.monsalve.com.co"