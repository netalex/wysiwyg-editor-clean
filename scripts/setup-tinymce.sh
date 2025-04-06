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
