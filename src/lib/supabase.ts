// src/lib/supabase.ts
// Servizio di autenticazione Supabase

import { createClient } from '@supabase/supabase-js';

// Configura il client Supabase
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL o Anon Key mancanti. Verifica le variabili d\'ambiente.');
}

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funzioni di autenticazione
export const auth = {
    /**
     * Effettua il login con email e password
     */
    async signInWithPassword(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * Effettua il login con magic link
     */
    async signInWithOtp(email: string) {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/admin`,
            },
        });

        if (error) throw error;
        return data;
    },

    /**
     * Effettua il logout
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Ottieni l'utente corrente
     */
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        return user;
    },

    /**
     * Verifica se l'utente è autenticato
     */
    async isAuthenticated() {
        try {
            const user = await this.getCurrentUser();
            return !!user;
        } catch (error) {
            return false;
        }
    },


    /**
     * Ottieni il ruolo dell'utente corrente
     */
    async getUserRole() {
        try {
            const user = await this.getCurrentUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data?.role || null;
        } catch (error) {
            console.error('Errore durante il recupero del ruolo:', error);
            return null;
        }
    },

    /**
     * Verifica se l'utente ha il ruolo specificato
     */
    async hasRole(role: string) {
        const userRole = await this.getUserRole();
        return userRole === role;
    },

    /**
     * Verifica se l'utente è un amministratore
     */
    async isAdmin() {
        return await this.hasRole('admin');
    }

    /**
     * Imposta un listener per i cambiamenti dello stato di autenticazione
     */
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

export default { supabase, auth };