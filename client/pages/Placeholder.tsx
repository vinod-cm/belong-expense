import { AppShell } from "@/components/AppShell";

export default function Placeholder({ title }: { title: string }) {
  return (
    <AppShell>
      <div className="rounded-lg border bg-white p-12 text-center text-muted-foreground">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-dashed">
          <span className="text-2xl">🛠️</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1">This page is a placeholder. Ask to generate its full UI next.</p>
      </div>
    </AppShell>
  );
}
