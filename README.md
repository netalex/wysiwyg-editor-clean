# 

Un editor WYSIWYG per Astro, progettato per siti statici e landing page con blog, ottimizzato per psicoterapeuti e professionisti.

## 🚀 Funzionalità

- Editor WYSIWYG completo utilizzando TinyMCE
- Salvataggio dei contenuti in localStorage (prototipo)
- Gestione post del blog
- Anteprima in tempo reale
- Interfaccia admin per la gestione dei contenuti
- Ottimizzato per WSL2/Windows con file watching migliorato

## 🧞 Comandi disponibili

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
├── public/             # File statici
│   └── assets/         # Asset (TinyMCE, immagini, ecc.)
├── src/
│   ├── components/     # Componenti Astro
│   │   └── WysiwygEditor.astro  # Componente editor WYSIWYG
│   ├── layouts/        # Layout di pagina
│   ├── pages/          # Pagine del sito
│   │   ├── admin/      # Area amministrativa
│   │   ├── blog/       # Blog
│   │   └── index.astro # Home page
│   └── styles/         # Fogli di stile
└── scripts/            # Script di utilità
    └── setup-tinymce.sh # Script per configurare TinyMCE
```

## 🔜 Prossimi passi

- Integrazione con Supabase Auth per autenticazione
- Integrazione con Cloudinary per la gestione delle immagini
- Integrazione con Git Gateway per salvare i contenuti nel repository
- Integrazione con DecapCMS

## 📝 Licenza

MIT
