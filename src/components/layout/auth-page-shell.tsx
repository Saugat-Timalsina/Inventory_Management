import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-100 to-background p-4 dark:from-violet-950/40">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="auth" />
      </div>
      {children}
    </div>
  );
}
