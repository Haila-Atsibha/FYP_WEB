"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BriefcaseBusiness, FileText, CheckCircle2, UserPlus, UploadCloud, Camera, ShieldCheck } from "lucide-react";
import api from "../../../../src/services/api";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../../src/hooks/useTranslation";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const STRONG_PASSWORD_HINT =
  "Use at least 8 characters with uppercase, lowercase, number, and special character.";

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
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [nationalId, setNationalId] = useState([]);
  const [nationalIdPreviews, setNationalIdPreviews] = useState([]);
  const [verificationSelfie, setSelfie] = useState(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState(null);
  const [educationalDocuments, setEducationalDocuments] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCamera, setActiveCamera] = useState(null); // 'selfie' or 'id'
  const videoRef = useRef();
  const streamRef = useRef(null);
  const idVideoRef = useRef();
  const idStreamRef = useRef(null);
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
      if (idStreamRef.current) {
        idStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!profileImage) {
      setProfileImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setProfileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  useEffect(() => {
    if (!nationalId || nationalId.length === 0) {
      setNationalIdPreviews([]);
      return;
    }
    const urls = nationalId.map(file => URL.createObjectURL(file));
    setNationalIdPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [nationalId]);

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

  const startIdCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t("auth_camera_not_supported"));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      idStreamRef.current = stream;
      if (idVideoRef.current) idVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error(e);
      setCameraError("Failed to start ID camera.");
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
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelfie(file);
      setSelfiePreviewUrl(URL.createObjectURL(blob));
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setActiveCamera(null);
    }, "image/jpeg");
  };

  const captureIdPhoto = () => {
    if (!idVideoRef.current || !idVideoRef.current.srcObject) {
      setCameraError(t("auth_camera_start_first"));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = idVideoRef.current.videoWidth;
    canvas.height = idVideoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(idVideoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `national_id_${nationalId.length + 1}.jpg`, { type: "image/jpeg" });
      setNationalId(prev => [...prev, file]);
      if (idStreamRef.current) {
        idStreamRef.current.getTracks().forEach((track) => track.stop());
        idStreamRef.current = null;
      }
      setActiveCamera(null);
    }, "image/jpeg");
  };

  const retakePhoto = () => {
    setSelfie(null);
    setSelfiePreviewUrl(null);
    setActiveCamera('selfie');
    startCamera();
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
    setSelfiePreviewUrl(null);
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
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setError(STRONG_PASSWORD_HINT);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profileImage) formData.append("profileImage", profileImage);
    if (nationalId && nationalId.length > 0) {
      nationalId.forEach(file => formData.append("nationalId", file));
    }
    if (verificationSelfie) formData.append("verificationSelfie", verificationSelfie);
    if (role === "provider") {
      selectedCats.forEach((c) => formData.append("categories[]", c));
      educationalDocuments.forEach((doc) => formData.append("educationalDocuments", doc));
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data?.message || t("auth_register_success"));
      resetForm();
      
      // Redirect to verification page
      setTimeout(() => {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`;
      }, 1500);
    } catch (err) {
      console.error("Registration submission failed:", err);
      setError(err.response?.data?.message || t("auth_register_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans overflow-hidden">
      
      {/* Left Column: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 bg-surface/50 border-r border-white/5 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-aurora opacity-70 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            QuickServe
          </span>
        </Link>

        <div className="relative z-10 my-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold font-heading text-foreground mb-6 leading-tight"
          >
            {t('auth_hero_register_title_1')} <br />
            <span className="text-gradient">{t('auth_hero_register_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-muted mb-8"
          >
            {t('auth_hero_register_desc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[t('auth_feature_ai'), t('auth_feature_access'), t('auth_feature_premium')].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted">
                <div className="bg-primary/10 rounded-full p-1 text-primary">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-medium text-foreground/80">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-text-muted">
          &copy; {new Date().getFullYear()} QuickServe. All rights reserved.
        </div>
      </div>

      {/* Right Column: Scrollable Registration Form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center p-6 lg:p-12 overflow-y-auto">
        <Link href="/" className="self-start mb-8 lg:hidden flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="text-2xl font-bold text-white">QuickServe</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">{t("auth_register_title")}</h2>
            <p className="text-text-muted">{t("auth_register_subtitle")}</p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="w-1.5 h-full rounded-full bg-green-500"></div>
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="w-1.5 h-full rounded-full bg-red-500"></div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
            {/* Basic Info Section */}
            <div className="bg-surface/30 border border-white/5 p-6 md:p-8 rounded-3xl space-y-5">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-primary" /> {t("auth_basic_info")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_full_name")}</label>
                  <Input
                    name="name"
                    id="name"
                    autoComplete="name"
                    placeholder={t("auth_name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-surface/50 backdrop-blur-sm border-border text-foreground placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_email")}</label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    placeholder={t("auth_email_placeholder_reg")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface/50 backdrop-blur-sm border-border text-foreground placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_password")}</label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="new-password"
                    placeholder={t("auth_password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-surface/50 backdrop-blur-sm border-border text-foreground placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                  />
                  <p className="text-xs text-text-muted mt-2 ml-1">{STRONG_PASSWORD_HINT}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_confirm_password")}</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder={t("auth_password_placeholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-surface/50 backdrop-blur-sm border-border text-foreground placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-2xl py-3 px-4 shadow-inner transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_account_type")}</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface/50 backdrop-blur-sm border-border text-foreground rounded-2xl px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                  >
                    <option value="customer" className="bg-surface text-foreground">{t("auth_customer")} - {t("auth_customer_desc")}</option>
                    <option value="provider" className="bg-surface text-foreground">{t("auth_provider")} - {t("auth_provider_desc")}</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="bg-surface/30 border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> {t("auth_identity_verification")}
              </h3>
              <p className="text-sm text-text-muted mb-6">{t("auth_identity_desc")}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_profile_image")}</label>
                  <div className="relative flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden relative ${profileImagePreview ? 'border-primary/50' : 'bg-surface/30 hover:bg-surface/50 hover:border-primary/50'}`}>
                      {profileImagePreview ? (
                        <>
                          <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover absolute inset-0 opacity-60" />
                          <div className="relative z-10 bg-black/40 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <UploadCloud className="w-4 h-4 text-white" />
                            <span className="text-xs text-white font-medium">Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-text-muted" />
                          <p className="mb-2 text-sm text-text-muted font-medium">{t("auth_click_upload_photo")}</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfileImage(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_national_id")}</label>
                  <div className="space-y-3">
                    <div className="relative flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden relative ${nationalIdPreviews.length > 0 ? 'border-primary/50' : 'bg-surface/30 hover:bg-surface/50 hover:border-primary/50'}`}>
                        {nationalIdPreviews.length > 0 ? (
                          <>
                            <div className="absolute inset-0 flex w-full h-full">
                              {nationalIdPreviews.map((url, idx) => (
                                <img key={idx} src={url} alt={`ID preview ${idx}`} className={`h-full object-cover opacity-60 ${nationalIdPreviews.length === 1 ? 'w-full' : 'w-1/2'}`} />
                              ))}
                            </div>
                            <div className="relative z-10 bg-black/50 px-3 py-1.5 rounded-lg flex flex-col items-center gap-1 backdrop-blur-sm">
                              <span className="text-xs text-white font-medium">Click to change/upload</span>
                              <span className="text-[10px] text-text-muted">{nationalId.length} selected</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileText className="w-8 h-8 mb-2 text-text-muted" />
                            <p className="mb-2 text-sm text-text-muted font-medium">{t("auth_upload_id_front_back")}</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setNationalId(Array.from(e.target.files))} />
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (activeCamera === 'id') {
                            if (idStreamRef.current) {
                              idStreamRef.current.getTracks().forEach(track => track.stop());
                              idStreamRef.current = null;
                            }
                            setActiveCamera(null);
                          } else {
                            if (streamRef.current) {
                              streamRef.current.getTracks().forEach(track => track.stop());
                              streamRef.current = null;
                            }
                            setActiveCamera('id');
                            await startIdCamera();
                          }
                        }}
                        className="flex-1 bg-surface border border-border text-foreground hover:bg-surface-hover py-2.5 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-2"
                      >
                        <Camera size={14} />
                        {activeCamera === 'id' ? 'Close ID Camera' : 'Take ID Photo with Camera'}
                      </button>
                      
                      {nationalId.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              setNationalId([]);
                              if (streamRef.current) {
                                streamRef.current.getTracks().forEach(track => track.stop());
                                streamRef.current = null;
                              }
                              setActiveCamera('id');
                              await startIdCamera();
                            }}
                            className="bg-primary text-white hover:bg-primary-hover px-4 py-2.5 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5"
                          >
                            <Camera size={14} />
                            Retake
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNationalId([]);
                              if (idStreamRef.current) {
                                idStreamRef.current.getTracks().forEach(track => track.stop());
                                idStreamRef.current = null;
                              }
                              setActiveCamera(null);
                            }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-3.5 py-2.5 rounded-xl font-medium transition-all text-xs"
                          >
                            Clear
                          </button>
                        </>
                      )}
                    </div>

                    {activeCamera === 'id' && (
                      <div className="bg-surface/50 rounded-2xl p-3.5 border border-border space-y-3">
                        <div className="relative rounded-xl overflow-hidden bg-black/40 aspect-video border border-border flex items-center justify-center">
                          <video ref={idVideoRef} className="w-full h-full object-cover absolute inset-0" autoPlay playsInline muted />
                          {!idStreamRef.current && <Camera className="w-10 h-10 text-white/20 relative z-10" />}
                        </div>
                        <button
                          type="button"
                          onClick={captureIdPhoto}
                          disabled={!idStreamRef.current}
                          className="w-full bg-primary text-white hover:bg-primary-hover py-2.5 rounded-xl font-semibold transition-all text-xs shadow-md disabled:opacity-50"
                        >
                          Capture ID Photo ({nationalId.length}/2 captured)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {role === "provider" && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">{t("auth_prof_docs")}</label>
                  <div className="relative flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-surface/30 hover:bg-surface/50 hover:border-primary/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="text-sm text-text-muted font-medium">{t("auth_upload_certs")}</p>
                        {educationalDocuments.length > 0 && <p className="text-xs text-primary mt-1">{educationalDocuments.length} {t("auth_files_selected")}</p>}
                      </div>
                      <input type="file" multiple ref={educationalDocsInputRef} className="hidden" onChange={(e) => setEducationalDocuments(Array.from(e.target.files))} />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 ml-1">{t("auth_selfie_verif")}</label>
                <div className="bg-surface/50 rounded-2xl p-4 border border-border">
                  <div className="flex gap-3 mb-4">
                    {!selfiePreviewUrl ? (
                      <>
                        <button type="button" onClick={startCamera} className="flex-1 bg-surface border border-border text-foreground hover:bg-surface-hover py-2.5 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2">
                          <Camera size={16} /> {t("auth_start_camera")}
                        </button>
                        <button type="button" onClick={capturePhoto} className="flex-1 bg-primary text-white hover:bg-primary-hover py-2.5 rounded-xl font-medium transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                          {t("auth_capture_photo")}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={retakePhoto} className="w-full bg-surface border border-border text-foreground hover:bg-surface-hover py-2.5 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2">
                        <Camera size={16} /> Retake Photo
                      </button>
                    )}
                  </div>
                  
                  <div className="relative rounded-xl overflow-hidden bg-black/40 aspect-video border border-border flex items-center justify-center">
                    {selfiePreviewUrl ? (
                      <img src={selfiePreviewUrl} alt="Selfie Preview" className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <>
                        <video ref={videoRef} className="w-full h-full object-cover absolute inset-0" autoPlay playsInline muted />
                        {!streamRef.current && <Camera className="w-12 h-12 text-white/20 relative z-10" />}
                      </>
                    )}
                  </div>

                  {verificationSelfie && (
                    <div className="mt-3 flex items-center justify-center text-sm text-green-400 font-medium bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                      <CheckCircle2 size={16} className="mr-2" /> {t("auth_selfie_success")}
                    </div>
                  )}
                  {cameraError && (
                    <div className="mt-3 text-sm text-red-400 font-medium bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                      {cameraError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {role === "provider" && (
              <div className="bg-surface/30 border border-white/5 p-6 md:p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <BriefcaseBusiness size={20} className="text-primary" /> {t("auth_service_categories")}
                </h3>
                <p className="text-sm text-text-muted mb-4">{t("auth_select_services")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-surface/50">
                      <input
                        type="checkbox"
                        value={c.id}
                        checked={selectedCats.includes(c.id)}
                        onChange={() => handleCatToggle(c.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-surface border-border bg-surface/50 mr-3 transition-all"
                      />
                      <span className="text-sm font-medium text-text-muted group-hover:text-foreground transition-colors">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary-hover border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 font-bold rounded-2xl" 
                loading={loading}
              >
                {loading ? t("auth_registering") : t("auth_complete_register_btn")}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm pt-6 border-t border-border">
            <p className="text-text-muted">
              {t("auth_already_account")}{" "}
              <Link href="/auth/login" className="text-primary font-bold hover:text-primary-hover transition-colors">
                {t("auth_login_here")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
