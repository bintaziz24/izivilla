FROM php:8.2-cli

# Installer les dépendances système et bibliothèques
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

# Vider le cache apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Installer les extensions PHP nécessaires (notamment pdo_pgsql pour la DB PostgreSQL Render)
RUN docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Répertoire de travail
WORKDIR /var/www

# Copier les fichiers du projet backend
COPY . .

# Installer les dépendances composer en production
RUN composer install --no-dev --optimize-autoloader

# Permissions pour storage et bootstrap/cache
RUN chmod -R 777 storage bootstrap/cache

# Exposer le port par défaut
EXPOSE 8080

# Script d'exécution au démarrage du container Render
CMD ["sh", "-c", "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
