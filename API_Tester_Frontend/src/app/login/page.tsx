"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveSessionUser } from "@/lib/auth-session";

type AuthResponse = {
  userId: number;
  name: string;
  email: string;
  message: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveSessionUser({
        userId: response.userId,
        name: response.name,
        email: response.email,
      });

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <section className="auth-card">
        <p className="auth-eyebrow">Welcome Back</p>
        <h1>Login to API Tester</h1>
        <p className="auth-copy">
          Access your collections, environments, and request history to continue
          testing APIs with speed and consistency.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" name="email" placeholder="you@example.com" required />

          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" name="password" placeholder="Enter your password" required />

          <button type="submit" className="btn btn-solid auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </p>
        <p className="auth-home-link">
          <Link href="/">Back to Landing Page</Link>
        </p>
      </section>
    </main>
  );
}
