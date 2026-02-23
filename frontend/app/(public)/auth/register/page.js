"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "../../../../src/services/api";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [nationalId, setNationalId] = useState(null);
  const [verificationSelfie, setSelfie] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef();

  useEffect(() => {
    if (role === "provider") {
      api.get("/api/categories").then((res) => setCategories(res.data));
    }
  }, [role]);

  const handleCatToggle = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.error(e);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
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
    setRole("customer");
    setSelectedCats([]);
    setProfileImage(null);
    setNationalId(null);
    setSelfie(null);
    // Reset file inputs manually if needed using refs, but clearing state is the primary goal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profileImage) formData.append("profileImage", profileImage);
    if (nationalId) formData.append("nationalId", nationalId);
    if (verificationSelfie) formData.append("verificationSelfie", verificationSelfie);
    if (role === "provider") {
      selectedCats.forEach((c) => formData.append("categories[]", c));
    }
    try {
      const res = await api.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Your account is pending admin verification.");
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-300 py-12 px-6">
      <div className="w-full max-w-2xl bg-surface border border-border p-10 rounded-3xl shadow-xl transition-all">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
          <p className="text-text-muted">Join QuickServe and start your journey</p>
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              id="name"
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Password"
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              >
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-8 mt-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Verification Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block mb-2 font-semibold text-foreground/80 text-sm ml-1">National ID</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setNationalId(e.target.files[0])}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="block mb-4 font-semibold text-foreground/80 text-sm ml-1">Selfie Verification</label>
              <div className="bg-background rounded-3xl p-6 border border-border overflow-hidden">
                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                  >
                    Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-primary text-white hover:bg-primary-hover px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                  >
                    Capture Photo
                  </button>
                </div>
                <video
                  ref={videoRef}
                  className="w-full rounded-2xl bg-black/5 aspect-video object-cover"
                  autoPlay
                  playsInline
                />
                {verificationSelfie && (
                  <div className="mt-4 flex items-center justify-center text-sm text-green-500 font-bold bg-green-500/10 py-2 rounded-lg">
                    ✓ Selfie captured successfully
                  </div>
                )}
              </div>
            </div>
          </div>

          {role === "provider" && (
            <div className="border-t border-border pt-8 mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Service Categories</h3>
              <p className="text-text-muted text-sm mb-6">Select the services you offer</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-auto p-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
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
            <Button type="submit" className="w-full py-4 text-lg">
              Complete Registration
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center text-sm border-t border-border pt-8">
          <p className="text-text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
