"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitState =
  | { type: "idle" }
  | { type: "saving"; message: string }
  | { type: "error"; message: string };

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<SubmitState>({ type: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setState({
        type: "error",
        message: "Add meg az admin jelszót.",
      });
      return;
    }

    try {
      setState({
        type: "saving",
        message: "Belépés...",
      });

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setState({
          type: "error",
          message: result.error ?? "Nem sikerült belépni.",
        });
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
      });
    }
  }

  return (
    <article className="soho-admin-card soho-admin-form-card soho-admin-login-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>Admin belépés</h2>
          <p>A tartalomkezelő felület jelszóval védett.</p>
        </div>
      </div>

      <form className="soho-admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Jelszó</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <div className="soho-admin-form-actions">
          <button type="submit" disabled={state.type === "saving"}>
            {state.type === "saving" ? state.message : "Belépés"}
          </button>
        </div>

        {state.type === "error" ? (
          <p className="soho-admin-form-message is-error">{state.message}</p>
        ) : null}
      </form>
    </article>
  );
}

