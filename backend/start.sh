#!/bin/sh

# Assurer que les dossiers de storage existent et ont les permissions
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache bootstrap/cache
chmod -R 777 storage bootstrap/cache

# Supprimer physiquement tous les fichiers de cache des routes et de config
rm -f bootstrap/cache/*.php storage/framework/cache/data/* 2>/dev/null || true

# Nettoyer et régénérer les caches Laravel
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true

# Générer la clé d'application si absente
if [ -z "$APP_KEY" ]; then
  echo "Generating application key..."
  php artisan key:generate --force
fi

# Exécuter les migrations si la DB est configurée
echo "Running database migrations..."
php artisan migrate --force || echo "Migration skipped or failed, check DB connection"

# Démarrer le serveur web sur le port configuré par Render
PORT_TO_USE="${PORT:-8080}"
echo "Starting server on port $PORT_TO_USE..."
exec php artisan serve --host=0.0.0.0 --port=$PORT_TO_USE
