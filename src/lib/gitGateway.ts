// src/lib/gitGateway.ts
// Servizio per l'integrazione con Git Gateway di Netlify

/**
 * GitGateway - Classe per interagire con Netlify Git Gateway
 * Permette di salvare i contenuti direttamente nel repository Git
 */
class GitGateway {
    private apiBase: string;
    private token: string | null = null;
    private repoOwner: string;
    private repoName: string;
    private branch: string;

    /**
     * Costruttore
     */
    constructor(options: {
        repoOwner: string;
        repoName: string;
        branch?: string;
    }) {
        this.apiBase = '/.netlify/git/github';
        this.repoOwner = options.repoOwner;
        this.repoName = options.repoName;
        this.branch = options.branch || 'main';
    }

    /**
     * Inizializza Git Gateway con il token dall'autenticazione di Netlify Identity
     */
    async init(): Promise<void> {
        // Ottieni il token da Netlify Identity
        // @ts-ignore - netlifyIdentity non è tipizzato
        if (window.netlifyIdentity) {
            // @ts-ignore
            const currentUser = window.netlifyIdentity.currentUser();

            if (currentUser) {
                this.token = currentUser.token.access_token;
            } else {
                throw new Error('Utente non autenticato. Effettua il login tramite Netlify Identity');
            }
        } else {
            // Alternativa: usa Supabase Auth + integrazione con Git Gateway
            console.warn('Netlify Identity non rilevato. Verifica se è stato importato correttamente.');

            // Qui potremmo implementare un'alternativa per ottenere il token
            // Ad esempio, chiamando un'API serverless che genera un token per Git Gateway
            try {
                // Chiamata API serverless per ottenere un token Git Gateway
                const response = await fetch('/.netlify/functions/git-gateway-token');
                const data = await response.json();

                if (data.token) {
                    this.token = data.token;
                } else {
                    throw new Error('Impossibile ottenere il token per Git Gateway');
                }
            } catch (error) {
                console.error('Errore durante l\'ottenimento del token:', error);
                throw new Error('Impossibile inizializzare Git Gateway');
            }
        }
    }

    /**
     * Controlla se Git Gateway è inizializzato
     */
    isInitialized(): boolean {
        return !!this.token;
    }

    /**
     * Effettua una richiesta a Git Gateway
     */
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        if (!this.token) {
            throw new Error('Git Gateway non inizializzato. Chiama init() prima di effettuare richieste');
        }

        const url = `${this.apiBase}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore Git Gateway: ${response.status} ${response.statusText}\n${errorText}`);
        }

        return await response.json() as T;
    }

    /**
     * Ottiene un file dal repository
     */
    async getFile(path: string): Promise<{ content: string; sha: string }> {
        const encodedPath = encodeURIComponent(path);
        const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${encodedPath}?ref=${this.branch}`;

        try {
            const response = await this.request<any>(endpoint);

            // Il contenuto è codificato in base64
            const content = atob(response.content);

            return {
                content,
                sha: response.sha,
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                // File non trovato, restituisci contenuto vuoto
                return {
                    content: '',
                    sha: '',
                };
            }

            throw error;
        }
    }

    /**
     * Salva un file nel repository
     */
    async saveFile(options: {
        path: string;
        content: string;
        message: string;
        sha?: string;
    }): Promise<{ sha: string }> {
        const { path, content, message, sha } = options;
        const encodedPath = encodeURIComponent(path);
        const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${encodedPath}`;

        const requestBody: any = {
            message,
            content: btoa(content), // Codifica il contenuto in base64
            branch: this.branch,
        };

        // Includi lo SHA solo se è fornito (necessario per aggiornare file esistenti)
        if (sha) {
            requestBody.sha = sha;
        }

        const response = await this.request<any>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(requestBody),
        });

        return {
            sha: response.content.sha,
        };
    }

    /**
     * Elimina un file dal repository
     */
    async deleteFile(options: {
        path: string;
        message: string;
        sha: string;
    }): Promise<void> {
        const { path, message, sha } = options;
        const encodedPath = encodeURIComponent(path);
        const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${encodedPath}`;

        await this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify({
                message,
                sha,
                branch: this.branch,
            }),
        });
    }

    /**
     * Crea un post del blog
     */
    async createBlogPost(options: {
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        date?: string;
        author?: string;
        tags?: string[];
        image?: string;
    }): Promise<{ sha: string }> {
        const {
            title,
            slug,
            content,
            excerpt = '',
            date = new Date().toISOString(),
            author = 'Admin',
            tags = [],
            image = '',
        } = options;

        // Crea il frontmatter in formato YAML
        const frontmatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: ${date}`,
            `author: "${author.replace(/"/g, '\\"')}"`,
            tags.length > 0 ? `tags: [${tags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]` : 'tags: []',
            image ? `image: "${image.replace(/"/g, '\\"')}"` : '',
            excerpt ? `excerpt: "${excerpt.replace(/"/g, '\\"')}"` : '',
            '---',
            '',
        ].filter(Boolean).join('\n');

        // Combina frontmatter e contenuto
        const fullContent = `${frontmatter}${content}`;

        // Percorso del file: src/content/blog/{slug}.md
        const filePath = `src/content/blog/${slug}.md`;

        // Messaggio di commit
        const commitMessage = `Creato post: ${title}`;

        // Salva il file nel repository
        return await this.saveFile({
            path: filePath,
            content: fullContent,
            message: commitMessage,
        });
    }

    /**
     * Aggiorna un post del blog
     */
    async updateBlogPost(options: {
        slug: string;
        title: string;
        content: string;
        excerpt?: string;
        author?: string;
        tags?: string[];
        image?: string;
        newSlug?: string;
    }): Promise<{ sha: string }> {
        const {
            slug,
            title,
            content,
            excerpt = '',
            author,
            tags,
            image,
            newSlug,
        } = options;

        // Percorso del file originale
        const originalFilePath = `src/content/blog/${slug}.md`;

        // Ottieni il file esistente per il suo SHA
        const existingFile = await this.getFile(originalFilePath);

        if (!existingFile.sha) {
            throw new Error(`Post non trovato: ${slug}`);
        }

        // Cerca di estrarre i dati dal frontmatter esistente
        const existingFrontmatter = this.extractFrontmatter(existingFile.content);
        const existingContent = this.extractContent(existingFile.content);

        // Crea il nuovo frontmatter
        const frontmatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: ${existingFrontmatter.date || new Date().toISOString()}`,
            `updatedAt: ${new Date().toISOString()}`,
            `author: "${(author || existingFrontmatter.author || 'Admin').replace(/"/g, '\\"')}"`,
            tags ? `tags: [${tags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]` : (existingFrontmatter.tags || 'tags: []'),
            image ? `image: "${image.replace(/"/g, '\\"')}"` : (existingFrontmatter.image ? `image: "${existingFrontmatter.image.replace(/"/g, '\\"')}"` : ''),
            excerpt ? `excerpt: "${excerpt.replace(/"/g, '\\"')}"` : (existingFrontmatter.excerpt ? `excerpt: "${existingFrontmatter.excerpt.replace(/"/g, '\\"')}"` : ''),
            '---',
            '',
        ].filter(Boolean).join('\n');

        // Combina frontmatter e contenuto
        const fullContent = `${frontmatter}${content || existingContent}`;

        // Se lo slug è cambiato, elimina il vecchio file e crea uno nuovo
        if (newSlug && newSlug !== slug) {
            // Elimina il file esistente
            await this.deleteFile({
                path: originalFilePath,
                message: `Rinominato post: ${slug} -> ${newSlug}`,
                sha: existingFile.sha,
            });

            // Crea il nuovo file
            return await this.saveFile({
                path: `src/content/blog/${newSlug}.md`,
                content: fullContent,
                message: `Aggiornato post: ${title} (rinominato da ${slug})`,
            });
        }

        // Altrimenti, aggiorna il file esistente
        return await this.saveFile({
            path: originalFilePath,
            content: fullContent,
            message: `Aggiornato post: ${title}`,
            sha: existingFile.sha,
        });
    }

    /**
     * Elimina un post del blog
     */
    async deleteBlogPost(slug: string): Promise<void> {
        const filePath = `src/content/blog/${slug}.md`;

        // Ottieni il file per il suo SHA
        const existingFile = await this.getFile(filePath);

        if (!existingFile.sha) {
            throw new Error(`Post non trovato: ${slug}`);
        }

        // Elimina il file
        await this.deleteFile({
            path: filePath,
            message: `Eliminato post: ${slug}`,
            sha: existingFile.sha,
        });
    }

    /**
     * Estrae i dati dal frontmatter di un file Markdown
     */
    private extractFrontmatter(content: string): Record<string, any> {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return {};
        }

        const frontmatterLines = match[1].split('\n');
        const frontmatter: Record<string, any> = {};

        frontmatterLines.forEach(line => {
            const colonIndex = line.indexOf(':');

            if (colonIndex > 0) {
                const key = line.slice(0, colonIndex).trim();
                let value = line.slice(colonIndex + 1).trim();

                // Rimuovi eventuali virgolette
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                // Converti array
                if (value.startsWith('[') && value.endsWith(']')) {
                    try {
                        // Estrai tag da formato array YAML
                        const tagsMatch = value.match(/\[(.*)\]/);
                        if (tagsMatch) {
                            const tagsStr = tagsMatch[1];
                            if (tagsStr.trim()) {
                                const tags = tagsStr.split(',').map(tag => {
                                    tag = tag.trim();
                                    if (tag.startsWith('"') && tag.endsWith('"')) {
                                        return tag.slice(1, -1);
                                    }
                                    return tag;
                                });
                                frontmatter[key] = tags;
                            } else {
                                frontmatter[key] = [];
                            }
                        } else {
                            frontmatter[key] = [];
                        }
                    } catch {
                        frontmatter[key] = value;
                    }
                } else {
                    frontmatter[key] = value;
                }
            }
        });

        return frontmatter;
    }

    /**
     * Estrae il contenuto di un file Markdown (escludendo il frontmatter)
     */
    private extractContent(content: string): string {
        const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
        return content.replace(frontmatterRegex, '');
    }

    /**
     * Ottiene tutti i post del blog
     */
    async getAllBlogPosts(): Promise<any[]> {
        try {
            // Ottieni il contenuto della directory del blog
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/src/content/blog?ref=${this.branch}`;
            const files = await this.request<any[]>(endpoint);

            // Filtra solo i file Markdown
            const markdownFiles = files.filter(file =>
                file.type === 'file' && file.name.endsWith('.md')
            );

            // Carica il contenuto di ogni file
            const posts = await Promise.all(
                markdownFiles.map(async file => {
                    const fileContent = await this.getFile(file.path);
                    const frontmatter = this.extractFrontmatter(fileContent.content);
                    const content = this.extractContent(fileContent.content);

                    // Estrai lo slug dal nome del file
                    const slug = file.name.replace(/\.md$/, '');

                    return {
                        slug,
                        title: frontmatter.title || slug,
                        date: frontmatter.date || '',
                        updatedAt: frontmatter.updatedAt || '',
                        author: frontmatter.author || 'Admin',
                        tags: frontmatter.tags || [],
                        image: frontmatter.image || '',
                        excerpt: frontmatter.excerpt || '',
                        content,
                        sha: fileContent.sha,
                    };
                })
            );

            // Ordina i post per data (più recenti prima)
            return posts.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            });
        } catch (error) {
            console.error('Errore durante il recupero dei post:', error);

            // Se la directory non esiste, restituisci un array vuoto
            if (error instanceof Error && error.message.includes('404')) {
                return [];
            }

            throw error;
        }
    }
}

// Esporta la classe GitGateway
export { GitGateway };

// Crea un'istanza predefinita con i valori dalle variabili d'ambiente
export const gitGateway = new GitGateway({
    repoOwner: import.meta.env.PUBLIC_GITHUB_OWNER || '',
    repoName: import.meta.env.PUBLIC_GITHUB_REPO || '',
    branch: import.meta.env.PUBLIC_GITHUB_BRANCH || 'main',
});

export default gitGateway;