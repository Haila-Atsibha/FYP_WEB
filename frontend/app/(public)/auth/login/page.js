"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../../../../src/context/AuthContext";
import Input from "../../../../src/components/Input";
import Button from "../../../../src/components/Button";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.email, formData.password);
      // Reset form after success
      setFormData({
        email: "",
        password: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-300 px-6">
      <div className="w-full max-w-md bg-surface border border-border p-10 rounded-3xl shadow-xl transition-all">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-text-muted">Login to manage your services</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            label="Email Address"
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="pt-4">
            <Button type="submit" className="w-full py-4 text-lg">
              Login
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-text-muted">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
