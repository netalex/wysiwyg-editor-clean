#!/bin/bash
# Nome file: setup-wysiwyg-editor.sh
# Da eseguire in /workspace/wysiwyg-editor-clean

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Initializing WYSIWYG Editor project for Astro${NC}"

# Installa Astro (se non esiste)
if [ ! -f "package.json" ]; then
  echo -e "${BLUE}Creating new Astro project with TypeScript...${NC}"
  pnpm create astro@latest . -- --typescript strict --skip-install

  # Configura git con le tue credenziali
  git config user.name "Alessandro Aprile"
  git config user.email "aprile.alessandro@gmail.com"
fi

# Installa dipendenze
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install

# Installa TinyMCE
echo -e "${BLUE}Installing TinyMCE...${NC}"
pnpm add tinymce

# Crea directory per TinyMCE self-hosted
echo -e "${BLUE}Setting up TinyMCE self-hosted...${NC}"
mkdir -p public/assets/tinymce

# Configura Astro ottimizzato per WSL se non già configurato
if [ ! -f "astro.config.mjs" ]; then
  cat > astro.config.mjs << 'EOL'
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  server: {
    host: true,
    port: 4321
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});
EOL
fi

# Crea file env.development per ottimizzare il file watching
cat > .env.development << 'EOL'
# Abilita polling per il file system
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
VITE_USE_POLLING=true

# Intervalli di polling ottimizzati per WSL2
CHOKIDAR_POLLING_INTERVAL=800
WATCHPACK_POLLING_INTERVAL=800
EOL

# Aggiungi script per configurare TinyMCE nel package.json
if ! grep -q "setup:tinymce" package.json; then
  # Crea file temporaneo con i nuovi script
  cat > /tmp/package-temp.json << 'EOL'
{
  "scripts": {
    "dev": "astro dev --host",
    "build": "astro build",
    "preview": "astro preview --host",
    "dev:windows": "cross-env CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=true astro dev --host",
    "setup:tinymce": "bash scripts/setup-tinymce.sh"
  }
}
EOL

  # Installa cross-env come dipendenza di sviluppo
  pnpm add -D cross-env

  # Unisci i file package.json (richiede jq)
  if command -v jq &> /dev/null; then
    jq -s '.[0] * .[1]' package.json /tmp/package-temp.json > /tmp/package-merged.json
    mv /tmp/package-merged.json package.json
  else
    echo -e "${YELLOW}jq non trovato. Aggiorna manualmente package.json con gli script necessari${NC}"
  fi
fi

# Crea directory per gli script
mkdir -p scripts

# Crea script per configurare TinyMCE self-hosted
cat > scripts/setup-tinymce.sh << 'EOL'
#!/bin/bash
# Script per configurare TinyMCE self-hosted

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up TinyMCE self-hosted${NC}"

# Crea directory per TinyMCE
mkdir -p public/assets/tinymce

# Controlla se l'archivio esiste già nella directory temp
if [ -f "../temp-tinymce/tinymce.zip" ]; then
  echo -e "${BLUE}Using existing TinyMCE archive...${NC}"
  cp ../temp-tinymce/tinymce.zip .
else
  # Scarica TinyMCE
  echo -e "${BLUE}Downloading TinyMCE...${NC}"
  curl -L https://download.tiny.cloud/tinymce/community/tinymce_6.7.3.zip -o tinymce.zip
fi

# Estrai l'archivio
echo -e "${BLUE}Extracting TinyMCE...${NC}"
unzip -q tinymce.zip -d temp-tinymce

# Copia i file nella directory pubblica
echo -e "${BLUE}Copying TinyMCE files to public directory...${NC}"
cp -r temp-tinymce/tinymce/* public/assets/tinymce/

# Pulisci i file temporanei
echo -e "${BLUE}Cleaning up temporary files...${NC}"
rm -rf temp-tinymce tinymce.zip

# Scarica il file lingua italiana
echo -e "${BLUE}Downloading Italian language pack...${NC}"
curl -L https://cdn.tiny.cloud/1/no-api-key/tinymce/langs/it.js -o public/assets/tinymce/langs/it.js

echo -e "${GREEN}✅ TinyMCE self-hosted setup complete!${NC}"
EOL

# Rendi eseguibile lo script
chmod +x scripts/setup-tinymce.sh

# Crea file .env.example se non esiste
if [ ! -f ".env.example" ]; then
  cat > .env.example << 'EOL'
# File di esempio per le variabili d'ambiente necessarie
# Copia questo file in .env e .env.production e imposta i valori corretti

# Configurazione di base
NODE_ENV=development
SITE_URL=http://localhost:4321

# Ottimizzazioni per WSL
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
VITE_USE_POLLING=true
CHOKIDAR_POLLING_INTERVAL=800
WATCHPACK_POLLING_INTERVAL=800

# Cloudinary per gestione immagini
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Supabase per autenticazione
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# GitHub/Git Gateway
PUBLIC_GITHUB_OWNER=your-github-username
PUBLIC_GITHUB_REPO=your-repo-name
PUBLIC_GITHUB_BRANCH=main

# Netlify Identity (per Git Gateway)
NETLIFY_IDENTITY_WEBHOOK_SECRET=your-netlify-identity-secret
EOL

  # Crea .env e .env.production dalla .env.example
  cp .env.example .env
  cp .env.example .env.production
fi

# Crea un .gitignore se non esiste
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOL'
# build output
dist/
.output/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
*.code-workspace
.history/

# TinyMCE
public/assets/tinymce/

# Local Netlify folder
.netlify
EOL
fi

echo -e "${GREEN}✅ Project setup complete!${NC}"
echo -e "Run ${YELLOW}pnpm dev:windows${NC} to start the development server"
echo -e "Then run ${YELLOW}pnpm setup:tinymce${NC} to configure TinyMCE self-hosted"