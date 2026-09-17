"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type AuthRealm = "sanctuary" | "grand-chamber";

interface PortalAuthFormProps {
  realm: AuthRealm;
  idLabel: string;
  idPlaceholder: string;
  passwordLabel: string;
  submitLabel: string;
  loadingLabel: string;
  successPath: string;
  note: string;
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

interface FieldErrors {
  identifier?: string;
  password?: string;
}

export default function PortalAuthForm({
  realm,
  idLabel,
  idPlaceholder,
  passwordLabel,
  submitLabel,
  loadingLabel,
  successPath,
  note,
}: PortalAuthFormProps) {
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
      next.identifier =
        "Provide your registered membership identifier.";
    }
    if (password.length === 0) {
      next.password = "Provide your password.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function normalizeIdentifier(raw: string): string {
    const trimmed = raw.trim();
    return trimmed.includes("@") ? trimmed : trimmed.toUpperCase();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: normalizeIdentifier(identifier),
          password,
          realm,
        }),
      });

      if (!response.ok) {
        let message = "The credentials were not recognized.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* keep the default message */
        }
        throw new Error(message);
      }

      router.replace(successPath);
      router.refresh();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== "The credentials were not recognized."
      ) {
        setFormError(error.message);
      } else {
        setFormError(
          "The authentication gateway could not be reached. " +
            "Your credentials were not submitted. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const ns = realm === "grand-chamber" ? "gc" : "sc";

  return (
    <form
      className={`pf-form ${ns}-pf-form`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="pf-field">
        <label className="pf-label" htmlFor={`${ns}-id`}>
          {idLabel}
        </label>
        <input
          id={`${ns}-id`}
          name="identifier"
          type="text"
          className="pf-input"
          placeholder={idPlaceholder}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (fieldErrors.identifier)
              setFieldErrors((p) => ({ ...p, identifier: undefined }));
            if (formError) setFormError(null);
          }}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          aria-invalid={Boolean(fieldErrors.identifier)}
          aria-describedby={
            fieldErrors.identifier ? `${ns}-id-error` : undefined
          }
          disabled={isSubmitting}
        />
        {fieldErrors.identifier ? (
          <p className="pf-field-error" id={`${ns}-id-error`} role="alert">
            {fieldErrors.identifier}
          </p>
        ) : null}
      </div>

      <div className="pf-field">
        <label className="pf-label" htmlFor={`${ns}-pw`}>
          {passwordLabel}
        </label>
        <div className="pf-input-wrap">
          <input
            id={`${ns}-pw`}
            name="password"
            type={showPassword ? "text" : "password"}
            className="pf-input"
            placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: undefined }));
              if (formError) setFormError(null);
            }}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? `${ns}-pw-error` : undefined
            }
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="pf-toggle"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="pf-field-error" id={`${ns}-pw-error`} role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p className="pf-form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        className={`pf-submit ${ns}-pf-submit`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span
            className="pf-loader"
            role="status"
            aria-label="Verifying credentials"
          />
        ) : null}
        <span className="pf-submit-text">
          {isSubmitting ? loadingLabel : submitLabel}
        </span>
      </button>

      <p className="pf-note">{note}</p>
    </form>
  );
}
