import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { DEMO_PASSWORD, demoAccounts, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — HelpDesk Lite Internal Support" },
      {
        name: "description",
        content:
          "HelpDesk Lite is a lightweight internal support workspace to submit, track and resolve IT and business requests.",
      },
      { property: "og:title", content: "HelpDesk Lite — Support, simplified." },
      {
        property: "og:description",
        content: "Submit, track and resolve internal requests without the enterprise overhead.",
      },
    ],
  }),
  component: SignInPage,
});

type Mode = "signin" | "signup";

function SignInPage() {
  const { signIn, signUp, user, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setPassword("");
    setConfirm("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (mode === "signup") {
      if (!name.trim()) next.name = "Full name is required.";
      else if (name.trim().length > 100) next.name = "Name must be under 100 characters.";
    }
    if (!email.trim()) next.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (mode === "signup" && password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (mode === "signup" && confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const session =
        mode === "signin" ? await signIn(email, password) : await signUp(name, email, password);
      toast.success(
        mode === "signin"
          ? `Welcome back, ${session.name.split(" ")[0]}.`
          : `Account created — welcome, ${session.name.split(" ")[0]}.`,
      );
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
      setErrors({ password: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,34%)_1fr]">
      <section className="flex flex-col justify-between bg-sidebar px-8 py-10 text-sidebar-foreground lg:px-10">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Inbox className="size-5" />
          </span>
          <span className="text-lg font-bold">HelpDesk Lite</span>
        </div>

        <div className="max-w-sm py-12">
          <h1 className="text-3xl font-bold lg:text-4xl">Support, simplified.</h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">
            A lightweight workspace for your team to submit, track, and resolve internal requests —
            without the enterprise overhead.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Submit a request in under 60 seconds",
              "Full visibility into request status",
              "Clear ownership and priority at a glance",
            ].map((line) => (
              <li key={line} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-sidebar-primary" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-sidebar-muted">© 2026 HelpDesk Lite — Internal Use Only</p>
      </section>

      <section className="flex items-center justify-center bg-secondary px-4 py-12">
        <div className="w-full max-w-md">
          <div className="surface-card overflow-hidden">
            <div className="grid grid-cols-2 border-b border-border">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`px-6 py-4 text-sm font-semibold transition-colors ${
                    mode === m
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="space-y-4 px-6 py-6" noValidate>
              {mode === "signup" ? (
                <label className="block">
                  <span className="text-sm font-medium">
                    Full name <span className="text-destructive">*</span>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    maxLength={100}
                    className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  {errors.name ? (
                    <span className="mt-1 block text-xs text-destructive">{errors.name}</span>
                  ) : null}
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-medium">
                  Email address <span className="text-destructive">*</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                {errors.email ? (
                  <span className="mt-1 block text-xs text-destructive">{errors.email}</span>
                ) : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                {errors.password ? (
                  <span className="mt-1 block text-xs text-destructive">{errors.password}</span>
                ) : null}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                Sign in
              </button>
            </form>
          </div>

          {import.meta.env.DEV ? (
            <div className="mt-8">
              <p className="label-caps text-center">Quick demo — sign in as</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(DEMO_PASSWORD);
                      setErrors({});
                    }}
                    className="surface-card px-4 py-3 text-left transition-colors hover:border-primary"
                  >
                    <p className="text-sm font-semibold">{a.role}</p>
                    <p className="font-mono text-xs text-muted-foreground">{a.email}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Demo password: <span className="font-mono">{DEMO_PASSWORD}</span>
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
