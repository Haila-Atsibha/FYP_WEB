"use client";

import { Check, X, ShieldCheck } from "lucide-react";
import { getPasswordChecks, isStrongPassword } from "../utils/passwordValidation";

const RULES = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "hasUppercase", label: "One uppercase letter (A–Z)" },
  { key: "hasLowercase", label: "One lowercase letter (a–z)" },
  { key: "hasNumber", label: "One number (0–9)" },
  { key: "hasSpecial", label: "One special character (!@#$…)" },
];

export default function PasswordStrengthIndicator({ password = "" }) {
  const checks = getPasswordChecks(password);
  const hasInput = password.length > 0;
  const allMet = isStrongPassword(password);

  return (
    <div
      className="mt-3 rounded-2xl border border-border bg-surface/40 p-3.5 sm:p-4"
      aria-live="polite"
    >
      <p className="text-xs font-semibold text-text-muted mb-2.5 uppercase tracking-wide">
        Password requirements
      </p>
      <ul className="space-y-2">
        {RULES.map(({ key, label }) => {
          const met = checks[key];
          const stateClass = !hasInput
            ? "text-text-muted"
            : met
              ? "text-green-500"
              : "text-red-400";

          return (
            <li
              key={key}
              className={`flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors ${stateClass}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  !hasInput
                    ? "border-border bg-surface/50"
                    : met
                      ? "border-green-500/40 bg-green-500/15"
                      : "border-red-500/40 bg-red-500/15"
                }`}
              >
                {hasInput ? (
                  met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ul>

      {allMet && hasInput && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-500 sm:text-sm">
          <ShieldCheck size={16} className="shrink-0" />
          Strong password — all requirements met
        </div>
      )}
    </div>
  );
}
