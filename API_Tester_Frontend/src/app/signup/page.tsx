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

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      const response = await apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      saveSessionUser({
        userId: response.userId,
        name: response.name,
        email: response.email,
      });

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <section className="auth-card">
        <p className="auth-eyebrow">Get Started</p>
        <h1>Create Your API Tester Account</h1>
        <p className="auth-copy">
          Sign up to save requests, build collections, and organize testing
          workflows across local, staging, and production environments.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full Name</label>
          <input id="signup-name" type="text" name="name" placeholder="Your name" required />

          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" name="email" placeholder="you@example.com" required />

          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" name="password" placeholder="Create a strong password" required />

          <button type="submit" className="btn btn-solid auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <p className="auth-switch">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
        <p className="auth-home-link">
          <Link href="/">Back to Landing Page</Link>
        </p>
      </section>
    </main>
  );
}
