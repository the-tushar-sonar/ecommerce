import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import { loginUser, registerUser, type AuthResult } from "./auth.api";

interface AuthFormProps {
  onAuthenticated: (result: AuthResult) => void;
  onCancel?: () => void;
}

type AuthMode = "login" | "register";

export default function AuthForm({ onAuthenticated, onCancel }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await loginUser({
              email: email.trim(),
              password,
            })
          : await registerUser({
              name: name.trim(),
              email: email.trim(),
              password,
            });

      onAuthenticated(result);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-panel-heading">
        <div>
          <p className="auth-eyebrow">INDIGO STORE ACCOUNT</p>
          <h2 id="auth-title">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="auth-description">
            {mode === "login"
              ? "Sign in to continue shopping."
              : "Join us to start shopping."}
          </p>
        </div>

        {onCancel && (
          <button
            className="auth-close"
            type="button"
            onClick={onCancel}
            aria-label="Close authentication"
          >
            ×
          </button>
        )}
      </div>

      <div className="auth-mode-switch" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          aria-pressed={mode === "login"}
          onClick={() => changeMode("login")}
        >
          Sign in
        </button>

        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          aria-pressed={mode === "register"}
          onClick={() => changeMode("register")}
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label className="auth-field">
            Full name
            <input
              id="auth-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
        )}

        <label className="auth-field">
          Email address
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="auth-field">
          Password
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="auth-switch-copy">
        {mode === "login" ? "New to Indigo Store?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => changeMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
