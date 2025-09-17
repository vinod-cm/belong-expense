import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FileText, Settings2, Users, Wallet } from "lucide-react";

export default function Index() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Expense Management</h1>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Setup"
            description="Manage Groups and Expense Accounts"
            icon={<Settings2 className="h-5 w-5" />}
            to="/expense/setup"
            action="Open"
          />
          <FeatureCard
            title="Purchase Workflow"
            description="Create and track PRs"
            icon={<FileText className="h-5 w-5" />}
            to="/expense/purchase"
            action="Create PR"
          />
          <FeatureCard
            title="Payment Workflow"
            description="Generate and process PVs"
            icon={<Wallet className="h-5 w-5" />}
            to="/expense/payment"
            action="Create PV"
          />
        </section>
      </div>
    </AppShell>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  to,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="grid size-8 place-items-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </div>
        <div className="ml-auto" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Button asChild>
          <Link to={to}>{action}</Link>
        </Button>
      </div>
    </div>
  );
}
