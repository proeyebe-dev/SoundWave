/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  useAuth.js — Hook d'authentification                        ║
 * ║  Membre 2 · SoundWave · feature/auth                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Hook React qui centralise toute la logique d'authentification.
 * C'est le point d'entrée principal pour l'auth dans les composants.
 *
 * Il combine :
 *   - authStore.js  (état global Zustand)
 *   - authService.js (appels Supabase)
 *
 * ─── CE QUE RETOURNE useAuth() ───────────────────────────────────
 *
 *  user          {object|null}   Utilisateur Supabase Auth connecté
 *  profile       {object|null}   Profil de la table profiles
 *  loading       {boolean}       true pendant la vérification de session
 *  initialized   {boolean}       true une fois la session vérifiée
 *  isLoggedIn    {boolean}       raccourci : !!user
 *
 *  signIn(email, password)       → Connecte, retourne { error }
 *  signUp(email, pw, username)   → Inscrit,  retourne { error }
 *  signInWithGoogle()            → OAuth Google, retourne { error }
 *  signOut()                     → Déconnecte, vide le store
 *  resetPassword(email)          → Email de reset, retourne { error }
 *
 * ─── UTILISATION ──────────────────────────────────────────────────
 *  import { useAuth } from '../hooks/useAuth';
 *
 *  // Vérifier si connecté
 *  const { isLoggedIn, user } = useAuth();
 *
 *  // Connexion dans un formulaire
 *  const { signIn } = useAuth();
 *  const handleSubmit = async () => {
 *    const { error } = await signIn(email, password);
 *    if (error) setErrorMsg(error.message);
 *  };
 *
 *  // Déconnexion
 *  const { signOut } = useAuth();
 *  <button onClick={signOut}>Se déconnecter</button>
 *
 *  // Afficher le nom de l'utilisateur
 *  const { profile } = useAuth();
 *  <p>Bonjour, {profile?.full_name}</p>
 */

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import {
  signIn       as svcSignIn,
  signUp       as svcSignUp,
  signOut      as svcSignOut,
  signInWithGoogle as svcGoogle,
  resetPassword as svcReset,
  getSession,
  onAuthStateChange,
} from "../services/authService";
import { supabase } from "../services/supabase";

// ─────────────────────────────────────────────────────────────────
// Récupère le profil depuis la table profiles
// ─────────────────────────────────────────────────────────────────
async function fetchProfile(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const {
    user, profile, loading, initialized,
    setUser, setProfile, setLoading, setInitialized, reset,
  } = useAuthStore();

  // Vérification de la session au montage de l'app (une seule fois)
  useEffect(() => {
    if (initialized) return;

    let active = true;

    async function init() {
      setLoading(true);
      const { session } = await getSession();

      if (!active) return;

      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (active) setProfile(prof);
      }

      setLoading(false);
      setInitialized(true);
    }

    init();

    // Écouter les changements d'état (login / logout / token refresh)
    const unsubscribe = onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (active) setProfile(prof);
        setLoading(false);
      }

      if (event === "SIGNED_OUT") {
        reset();
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [initialized]);

  // ── Actions exposées ────────────────────────────────────────────

  async function signIn(email, password) {
    setLoading(true);
    const { user: u, error } = await svcSignIn(email, password);
    if (!error && u) {
      setUser(u);
      const prof = await fetchProfile(u.id);
      setProfile(prof);
    }
    setLoading(false);
    return { error };
  }

  async function signUp(email, password, username) {
    setLoading(true);
    const { user: u, error } = await svcSignUp(email, password, username);
    if (!error && u) {
      setUser(u);
      const prof = await fetchProfile(u.id);
      setProfile(prof);
    }
    setLoading(false);
    return { error };
  }

  async function signInWithGoogle() {
    return svcGoogle();
  }

  async function signOut() {
    await svcSignOut();
    reset();
  }

  async function resetPassword(email) {
    return svcReset(email);
  }

  return {
    // État
    user,
    profile,
    loading,
    initialized,
    isLoggedIn: !!user,

    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
