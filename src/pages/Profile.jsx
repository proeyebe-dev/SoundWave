import { useState, useEffect, useRef } from "react";
import { getProfile, updateProfile, updateAvatar, getCurrentUser } from "../services/userService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal";
import { ToastContainer, useToast } from "../components/ui/Toast";

const Profile = () => {
  const { toasts, addToast, removeToast } = useToast();
  const fileInputRef = useRef(null);

  const [user,            setUser]            = useState(null);
  const [profile,         setProfile]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [showPremium,     setShowPremium]     = useState(false);
  const [previewUrl,      setPreviewUrl]      = useState(null);
  const [form,            setForm]            = useState({ full_name: "", username: "", bio: "" });
  const [errors,          setErrors]          = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        const profileData = await getProfile(currentUser.id);
        setProfile(profileData);
        setForm({
          full_name: profileData.full_name || "",
          username:  profileData.username  || "",
          bio:       profileData.bio       || "",
        });
      } catch (err) {
        addToast("Erreur lors du chargement du profil", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())   e.full_name = "Le nom est requis";
    if (!form.username.trim())    e.username  = "Le nom d'utilisateur est requis";
    if (form.username.length < 3) e.username  = "Minimum 3 caractères";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, form);
      setProfile(updated);
      addToast("Profil mis à jour avec succès !", "success");
      setShowModal(false);
    } catch (err) {
      addToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast("Image trop lourde (max 2 Mo)", "warning");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUploadAvatar(file);
  };

  const handleUploadAvatar = async (file) => {
    setUploadingAvatar(true);
    try {
      const updated = await updateAvatar(user.id, file);
      setProfile(updated);
      addToast("Photo de profil mise à jour !", "success");
    } catch (err) {
      addToast("Erreur lors de l'upload", "error");
      setPreviewUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader variant="equalizer" size="lg" text="Chargement..." />
      </div>
    );
  }

  const avatarSrc = previewUrl || profile?.avatar_url || "";

  // Copier le lien du profil
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Lien copié dans le presse-papier !", "success");
  };

  // Playlists fictives pour l'affichage
  const fakePlaylists = [
    { id: 1, name: "Mes favoris", count: 24, color: "from-purple-500 to-blue-600" },
    { id: 2, name: "Chill Vibes", count: 18, color: "from-green-500 to-teal-600" },
    { id: 3, name: "Workout 🔥", count: 31, color: "from-orange-500 to-red-600" },
    { id: 4, name: "Late Night", count: 12, color: "from-blue-600 to-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600 via-green-900 to-black" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #1db954 0%, transparent 50%), radial-gradient(circle at 80% 20%, #158a3e 0%, transparent 40%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ── CONTENU ────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10">

        {/* Avatar + infos */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 md:-mt-28 mb-6">

          {/* Avatar */}
          <div className="relative group shrink-0 self-start">
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-full ring-4 ring-black shadow-2xl shadow-black overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-6xl font-black text-black select-none">
                  {profile?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1"
            >
              {uploadingAvatar
                ? <Loader size="sm" variant="spinner" />
                : <><span className="text-2xl">📷</span><span className="text-xs font-semibold tracking-wide">Modifier</span></>
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Textes */}
          <div className="flex-1 pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Profil</p>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                {profile?.full_name || "Nom inconnu"}
              </h1>
              {/* Badge Premium cliquable */}
              <span
                onClick={() => setShowPremium(true)}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-yellow-500/30 tracking-wide cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                ✦ PREMIUM
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-2">
              <span>@{profile?.username || "username"}</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-white">12</strong> playlists</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-white">48</strong> titres likés</span>
              <span className="text-white/20">•</span>
              <span>Membre depuis {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : "—"}
              </span>
            </div>

            {profile?.bio && (
              <p className="text-white/60 text-sm max-w-md leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* ── BOUTONS ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-10">
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
            Modifier le profil
          </Button>
          <Button variant="ghost" size="lg" icon="🔗" onClick={handleShare}>
            Partager
          </Button>
        </div>

        {/* ── INFOS COMPTE ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
            Informations du compte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/5 hover:bg-white/8 transition-colors duration-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg shrink-0">📧</div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-white font-medium text-sm">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="bg-white/5 hover:bg-white/8 transition-colors duration-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg shrink-0">🎵</div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Nom d'utilisateur</p>
                <p className="text-white font-medium text-sm">@{profile?.username || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PLAYLISTS ────────────────────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
              Playlists publiques
            </h2>
            <span className="text-xs text-green-400 hover:underline cursor-pointer font-semibold">
              Voir tout
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fakePlaylists.map((pl) => (
              <div
                key={pl.id}
                className="group bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl p-4 cursor-pointer hover:scale-105"
              >
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${pl.color} mb-3 flex items-center justify-center text-3xl shadow-lg`}>
                  🎵
                </div>
                <p className="text-white font-semibold text-sm truncate">{pl.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{pl.count} titres</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── MODAL ──────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setErrors({}); }}
        title="Modifier le profil"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Ex : Raïssa Dupont"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            error={errors.full_name}
            icon="👤"
          />
          <Input
            label="Nom d'utilisateur"
            placeholder="Ex : raissa_music"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            icon="🎵"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-white/70">Bio</label>
            <textarea
              placeholder="Parle de toi en quelques mots..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={160}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all duration-300 resize-none"
            />
            <span className="text-xs text-white/30 text-right">{form.bio.length}/160</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowModal(false); setErrors({}); }} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving} className="flex-1">
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL PREMIUM ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        title="✦ SoundWave Premium"
        size="sm"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-yellow-500/30">
            👑
          </div>
          <div>
            <p className="text-white font-bold text-lg">Vous êtes abonné Premium</p>
            <p className="text-white/50 text-sm mt-1">Profitez de toutes les fonctionnalités sans limite.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-left space-y-2">
            {["Écoute sans publicité", "Qualité audio maximale", "Téléchargement hors ligne", "Accès illimité"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-green-400 font-bold">✓</span> {f}
              </div>
            ))}
          </div>
          <Button variant="primary" onClick={() => setShowPremium(false)} className="w-full">
            Super, merci !
          </Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Profile;