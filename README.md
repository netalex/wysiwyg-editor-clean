# Editor WYSIWYG per Astro

Un editor WYSIWYG completo per Astro, progettato specificamente per siti statici e landing page con blog, ottimizzato per psicoterapeuti e professionisti.

## 🚀 Funzionalità

- ✅ Editor WYSIWYG completo utilizzando TinyMCE self-hosted
- ✅ Autenticazione tramite Supabase Auth
- ✅ Caricamento immagini con Cloudinary
- ✅ Persistenza dei contenuti tramite Git Gateway
- ✅ Interfaccia admin protetta da autenticazione
- ✅ Anteprima in tempo reale dei contenuti
- ✅ Ottimizzato per WSL2/Windows con file watching migliorato
- ✅ Componenti modulari e facilmente integrabili

## 🛠️ Tecnologie utilizzate

- **Astro**: Framework per siti statici ottimizzato per prestazioni
- **TinyMCE**: Editor WYSIWYG completo (modalità self-hosted)
- **Supabase Auth**: Servizio di autenticazione moderna
- **Cloudinary**: Gestione e ottimizzazione immagini
- **Git Gateway**: Persistenza dati tramite repository Git
- **Docker**: Ambiente di sviluppo containerizzato

## 🧞 Guida rapida

### Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Account [Cloudinary](https://cloudinary.com/) (gratuito)
- Account [Supabase](https://supabase.com/) (piano gratuito)
- Repository GitHub/GitLab
- Account [Netlify](https://www.netlify.com/) (per Git Gateway)

### Configurazione dell'ambiente

1. Clona questo repository
   ```bash
   git clone https://github.com/username/wysiwyg-editor.git
   cd wysiwyg-editor
   ```

2. Crea i file di configurazione
   ```bash
   cp .env.example .env
   cp .env.example .env.production
   ```

3. Modifica i file `.env` e `.env.production` con i tuoi valori

4. Avvia il container Docker
   ```bash
   docker-compose up -d
   ```

5. Accedi al container e inizializza il progetto
   ```bash
   docker exec -it wysiwyg-editor-app bash
   cd /workspace
   bash setup-wysiwyg.sh wysiwyg-editor
   cd wysiwyg-editor
   pnpm setup:tinymce
   ```

6. Avvia il server di sviluppo
   ```bash
   pnpm dev:windows
   ```

7. Accedi all'applicazione su http://localhost:4321

## 📋 Comandi disponibili

```bash
# Avvia server di sviluppo (ottimizzato per Windows/WSL)
pnpm dev:windows

# Avvia server di sviluppo normale
pnpm dev

# Build del progetto
pnpm build

# Anteprima della build
pnpm preview

# Configura TinyMCE self-hosted
pnpm setup:tinymce
```

## 📂 Struttura del progetto

```
/
├── netlify/          # Funzioni serverless per Netlify
│   └── functions/    # Funzioni per Git Gateway e autenticazione
├── public/           # File statici
│   └── assets/       # Asset (TinyMCE, immagini, ecc.)
├── src/
│   ├── components/   # Componenti Astro
│   │   ├── AuthGuard.astro               # Protezione pagine admin
│   │   ├── CloudinaryUploader.astro      # Gestione upload immagini
│   │   └── WysiwygEditor.astro           # Componente editor WYSIWYG
│   ├── layouts/      # Layout di pagina
│   ├── lib/          # Librerie e servizi
│   │   ├── gitGateway.ts                 # Integrazione con Git Gateway
│   │   └── supabase.ts                   # Autenticazione con Supabase
│   ├── pages/        # Pagine del sito
│   │   ├── admin/    # Area amministrativa
│   │   ├── blog/     # Blog
│   │   └── index.astro # Home page
│   └── styles/       # Fogli di stile
├── scripts/          # Script di utilità
│   └── setup-tinymce.sh # Script per configurare TinyMCE
├── astro.config.mjs  # Configurazione Astro
├── docker-compose.yml # Configurazione Docker
└── Dockerfile        # Definizione del container Docker
```

## 🔧 Configurazione

### Supabase Auth

1. Crea un nuovo progetto su [Supabase](https://app.supabase.io/)
2. Vai a impostazioni del progetto > API
3. Copia l'URL e la chiave anonima e inseriscile in `.env`
4. Configura l'autenticazione via email con password o magic link

### Cloudinary

1. Registrati su [Cloudinary](https://cloudinary.com/)
2. Vai al Dashboard > Settings > Upload
3. Crea un nuovo upload preset (imposta come "unsigned" per semplicità)
4. Copia il nome del cloud e il preset e inseriscili in `.env`

### Git Gateway / Netlify

1. Crea un nuovo sito su [Netlify](https://app.netlify.com/)
2. Connetti il tuo repository GitHub/GitLab
3. Vai a Settings > Identity e abilita Netlify Identity
4. Nella stessa pagina, vai in basso e abilita Git Gateway
5. Copia la chiave segreta e inseriscila in `.env`

## 🔐 Protezione delle rotte amministrative

Per proteggere qualsiasi pagina amministrativa, avvolgi il contenuto con il componente `AuthGuard`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AuthGuard from '../../components/AuthGuard.astro';
import WysiwygEditor from '../../components/WysiwygEditor.astro';
---

<BaseLayout title="Admin - WYSIWYG Editor">
  <AuthGuard>
    <div class="admin-container">
      <h1>Area Protetta</h1>
      <WysiwygEditor />
    </div>
  </AuthGuard>
</BaseLayout>
```

## 🌐 Integrazione in un progetto esistente

1. Copia la cartella `src/components` nel tuo progetto
2. Copia la cartella `src/lib` nel tuo progetto
3. Imposta le variabili d'ambiente necessarie
4. Importa e utilizza i componenti nelle tue pagine

## 📝 Uso dell'editor WYSIWYG

```astro
---
import WysiwygEditor from '../components/WysiwygEditor.astro';
---

<WysiwygEditor 
  id="my-editor"
  initialContent="<p>Contenuto iniziale</p>"
  height={500}
  cloudinaryUploadPreset="your-preset"
  cloudinaryCloudName="your-cloud-name"
/>
```

## 🔍 Risoluzione problemi

### TinyMCE non si carica

Assicurati di aver eseguito correttamente:

```bash
pnpm setup:tinymce
```

Verifica che i file siano presenti in `public/assets/tinymce/`

### Errori di connessione a Supabase o Cloudinary

Verifica che le variabili d'ambiente siano impostate correttamente in `.env`

### Problemi di caricamento immagini

Verifica che l'upload preset di Cloudinary sia configurato come "unsigned" nelle impostazioni di Cloudinary

## 📝 Licenza

MIT

## 🙏 Riconoscimenti

- [Astro](https://astro.build/)
- [TinyMCE](https://www.tiny.cloud/)
- [Supabase](https://supabase.com/)
- [Cloudinary](https://cloudinary.com/)
- [Netlify](https://www.netlify.com/)