"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VeilEmblem from "./components/VeilEmblem";

interface FieldErrors {
  identifier?: string;
  password?: string;
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const next: FieldErrors = {};
    if (identifier.trim().length === 0) {
      next.identifier = "Enter your member ID or registered email.";
    }
    if (password.length === 0) {
      next.password = "Enter your password.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      if (!response.ok) {
        let message = "Authentication failed.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // keep the default message
        }
        throw new Error(message);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed.") {
        setFormError(
          "The credentials were not recognized. Please verify your member ID and password."
        );
      } else {
        setFormError(
          "The authentication gateway could not be reached. Your credentials were not submitted. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-aura" aria-hidden="true" />
      <div className="login-arch" aria-hidden="true" />
      <div className="login-orbit" aria-hidden="true" />

      <div className="login-shell">
        <header className="login-header">
          <div className="login-emblem-seal">
            <VeilEmblem className="login-emblem" />
          </div>
          <p className="login-eyebrow">THE BROTHERHOOD OF LIGHT</p>
          <h1 className="login-wordmark">VEIL</h1>
          <div className="login-divider" aria-hidden="true" />
          <p className="login-access">PRIVATE ACCESS</p>
        </header>

        <div className="login-panel">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="identifier">
                Membership ID
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                className="login-input"
                placeholder="BOL-XXXX"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  if (fieldErrors.identifier) {
                    setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                  }
                  if (formError) {
                    setFormError(null);
                  }
                }}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                aria-invalid={Boolean(fieldErrors.identifier)}
                aria-describedby={
                  fieldErrors.identifier ? "identifier-error" : undefined
                }
                disabled={isSubmitting}
              />
              {fieldErrors.identifier ? (
                <p className="login-field-error" id="identifier-error">
                  {fieldErrors.identifier}
                </p>
              ) : null}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">
                PASSWORD
              </label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                    if (formError) {
                      setFormError(null);
                    }
                  }}
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="login-field-error" id="password-error">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="login-form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span
                  className="login-loader"
                  role="status"
                  aria-label="Verifying identity"
                />
              ) : null}
              <span className="login-submit-text">
                {isSubmitting ? "VERIFYING IDENTITY" : "ENTER THE VEIL"}
              </span>
            </button>

            <p className="login-forgot">
              Forgot your password? Contact an authorized administrator.
            </p>
          </form>
        </div>

        <footer className="login-footer">
          <p className="login-security">AUTHORIZED ACCESS ONLY</p>
          <p className="login-restricted">
            This portal is restricted to recognized members, candidates, and
            authorized officers of The Brotherhood of Light.
          </p>
          <Link href="/" className="login-back">
            ← RETURN TO THE ENTRANCE
          </Link>
        </footer>
      </div>
    </main>
  );
}