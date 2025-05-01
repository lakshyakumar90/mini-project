import { ThemeToggle } from "@/components/theme-toggle";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <ThemeToggle />
      <main className="container mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}