/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  authService.js — Service d'authentification Supabase        ║
 * ║  Membre 2 · SoundWave · feature/auth                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Ce fichier contient TOUTES les opérations liées à l'authentification.
 * Il communique directement avec Supabase Auth.
 *
 * Aucun autre membre ne doit modifier ce fichier.
 * Pour utiliser l'auth dans un composant → utiliser le hook useAuth.js
 *
 * ─── FONCTIONS EXPORTÉES ─────────────────────────────────────────
 *
 *  signUp(email, password, username)
 *    → Crée un compte + crée automatiquement le profil dans la table profiles
 *    → Retourne : { user, error }
 *
 *  signIn(email, password)
 *    → Connecte un utilisateur existant
 *    → Retourne : { user, error }
 *
 *  signInWithGoogle()
 *    → Connexion OAuth via Google (redirige vers Google)
 *    → Retourne : { error }
 *
 *  signOut()
 *    → Déconnecte l'utilisateur actuel
 *    → Retourne : { error }
 *
 *  getSession()
 *    → Récupère la session active (utilisateur connecté ou null)
 *    → Retourne : { session, error }
 *
 *  onAuthStateChange(callback)
 *    → Écoute les changements d'état (connexion / déconnexion)
 *    → callback reçoit (event, session)
 *    → Retourne : la fonction de nettoyage (unsubscribe)
 *
 *  resetPassword(email)
 *    → Envoie un email de réinitialisation de mot de passe
 *    → Retourne : { error }
 *
 * ─── UTILISATION ──────────────────────────────────────────────────
 *  // Dans un composant, préférer le hook useAuth :
 *  import { useAuth } from '../hooks/useAuth';
 *  const { user, signIn, signOut } = useAuth();
 *
 *  // Accès direct au service (pour des cas avancés) :
 *  import { signIn } from '../services/authService';
 */

import { supabase } from "./supabase";

// ─────────────────────────────────────────────────────────────────
// Inscription
// ─────────────────────────────────────────────────────────────────
export async function signUp(email, password, username) {
  // 1. Créer le compte Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) return { user: null, error };

  // 2. Créer automatiquement le profil dans la table profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id:         data.user.id,
      username:   username.toLowerCase().trim(),
      full_name:  username,
      created_at: new Date().toISOString(),
    });

  if (profileError) return { user: null, error: profileError };

  return { user: data.user, error: null };
}

// ─────────────────────────────────────────────────────────────────
// Connexion email / mot de passe
// ─────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    email.trim(),
    password,
  });

  return { user: data?.user ?? null, error };
}

// ─────────────────────────────────────────────────────────────────
// Connexion Google (OAuth)
// ─────────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  return { error };
}

// ─────────────────────────────────────────────────────────────────
// Déconnexion
// ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ─────────────────────────────────────────────────────────────────
// Récupérer la session active
// ─────────────────────────────────────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

// ─────────────────────────────────────────────────────────────────
// Écouter les changements d'état d'authentification
// ─────────────────────────────────────────────────────────────────
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  // Retourne la fonction de nettoyage pour useEffect
  return () => data.subscription.unsubscribe();
}

// ─────────────────────────────────────────────────────────────────
// Réinitialisation du mot de passe
// ─────────────────────────────────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { error };
}
