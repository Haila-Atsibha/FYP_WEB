"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BriefcaseBusiness, FileText } from "lucide-react";
import api from "../../../../src/services/api";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import { motion } from "framer-motion";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [nationalId, setNationalId] = useState([]);
  const [verificationSelfie, setSelfie] = useState(null);
  const [educationalDocuments, setEducationalDocuments] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef();
  const streamRef = useRef(null);
  const educationalDocsInputRef = useRef();

  useEffect(() => {
    if (role === "provider") {
      api.get("/api/categories").then((res) => setCategories(res.data));
    }
  }, [role]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCatToggle = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t("auth_camera_not_supported"));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      const name = e?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError(t("auth_camera_permission_denied"));
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError(t("auth_camera_not_found"));
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError(t("auth_camera_in_use"));
      } else if (name === "SecurityError") {
        setCameraError(t("auth_camera_security_error"));
      } else {
        setCameraError(t("auth_camera_start_failed"));
      }
      console.error(e);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      setCameraError(t("auth_camera_start_first"));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      setSelfie(blob);
    });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("customer");
    setSelectedCats([]);
    setProfileImage(null);
    setNationalId([]);
    setSelfie(null);
    setEducationalDocuments([]);
    if (educationalDocsInputRef.current) educationalDocsInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError(t("auth_passwords_mismatch"));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profileImage) formData.append("profileImage", profileImage);
    if (nationalId && nationalId.length > 0) {
      nationalId.forEach(file => formData.append("nationalId[]", file));
    }
    if (verificationSelfie) formData.append("verificationSelfie", verificationSelfie);
    if (role === "provider") {
      selectedCats.forEach((c) => formData.append("categories[]", c));
      educationalDocuments.forEach((doc) => formData.append("educationalDocuments[]", doc));
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data?.message || t("auth_register_success"));
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || t("auth_register_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] py-12 px-6 relative w-full overflow-hidden z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl glass-card p-10 rounded-3xl transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-10 text-center relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
            <BriefcaseBusiness size={28} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{t("auth_register_title")}</h2>
          <p className="text-text-muted">{t("auth_register_subtitle")}</p>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t("auth_full_name")}
              name="name"
              id="name"
              autoComplete="name"
              placeholder={t("auth_name_placeholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
            />
            <Input
              label={t("auth_email")}
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              placeholder={t("auth_email_placeholder_reg")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t("auth_password")}
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              placeholder={t("auth_password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
            />
            <Input
              label={t("auth_confirm_password")}
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              placeholder={t("auth_password_placeholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-surface/50 border-white/10 text-white focus:border-primary/50"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">{t("auth_account_type")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface/50 border border-white/10 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            >
              <option value="customer">{t("auth_customer")}</option>
              <option value="provider">{t("auth_provider")}</option>
            </select>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8">
            <h3 className="text-lg font-bold text-foreground mb-6">{t("auth_verification_details")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">{t("auth_profile_image")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">{t("auth_national_id")}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNationalId(Array.from(e.target.files))}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
                />
                {nationalId.length > 0 && (
                  <div className="mt-2 text-xs text-text-muted ml-1">
                    {t("auth_selected_items")}{nationalId.length}
                  </div>
                )}
              </div>
            </div>

            {role === "provider" && (
              <div className="mt-8 bg-surface/30 p-6 rounded-3xl border border-dashed border-white/20">
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  {t("auth_prof_docs")}
                </h4>
                <p className="text-text-muted text-xs mb-4">{t("auth_prof_docs_desc")}</p>
                <input
                  type="file"
                  multiple
                  ref={educationalDocsInputRef}
                  onChange={(e) => setEducationalDocuments(Array.from(e.target.files))}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
                />
                {educationalDocuments.length > 0 && (
                  <div className="mt-3 text-xs text-text-muted">
                    {t("auth_selected")}{educationalDocuments.map(d => d.name).join(", ")}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <label className="block mb-4 font-semibold text-foreground/80 text-sm ml-1">{t("auth_selfie_verif")}</label>
              <div className="bg-surface/30 rounded-3xl p-6 border border-white/10 overflow-hidden">
                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                  >
                    {t("auth_start_camera")}
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                  >
                    {t("auth_capture_photo")}
                  </button>
                </div>
                <video
                  ref={videoRef}
                  className="w-full rounded-2xl bg-black/20 aspect-video object-cover"
                  autoPlay
                  playsInline
                />
                {verificationSelfie && (
                  <div className="mt-4 flex items-center justify-center text-sm text-green-400 font-bold bg-green-500/10 py-2 rounded-lg">
                    {t("auth_selfie_success")}
                  </div>
                )}
                {cameraError && (
                  <div className="mt-4 text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg">
                    {cameraError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {role === "provider" && (
            <div className="border-t border-white/10 pt-8 mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">{t("auth_service_categories")}</h3>
              <p className="text-text-muted text-sm mb-6">{t("auth_select_services")}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-auto p-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center p-3 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer group">
                    <input
                      type="checkbox"
                      value={c.id}
                      checked={selectedCats.includes(c.id)}
                      onChange={() => handleCatToggle(c.id)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-surface mr-3"
                    />
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8">
            <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary border-0 shadow-lg shadow-primary/20 transition-all font-semibold" loading={loading}>
              {loading ? t("auth_registering") : t("auth_complete_register_btn")}
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center text-sm border-t border-white/10 pt-8 relative z-10">
          <p className="text-text-muted">
            {t("auth_already_account")}{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:text-secondary group transition-all">
              {t("auth_login_here")}
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary mt-0.5" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
