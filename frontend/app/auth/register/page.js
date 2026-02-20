"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../../src/services/api";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mb-4">
            <label className="block mb-1 font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            >
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">National ID</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setNationalId(e.target.files[0])}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Selfie / Capture</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={startCamera}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
              >
                Start Camera
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
              >
                Capture
              </button>
            </div>
            <video
              ref={videoRef}
              className="mt-2 w-full rounded-xl"
              autoPlay
              playsInline
            />
            {verificationSelfie && (
              <p className="mt-2 text-sm text-green-600">Selfie captured</p>
            )}
          </div>

          {role === "provider" && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Service Categories
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={c.id}
                      checked={selectedCats.includes(c.id)}
                      onChange={() => handleCatToggle(c.id)}
                      className="mr-2"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
