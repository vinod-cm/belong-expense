import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Search, User2 } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/20">
        <Sidebar className="border-r bg-white data-[state=expanded]:w-64">
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
              <span>Financials</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Expense</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}> 
                      <Link to="/">Dashboard</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/expense/setup")}> 
                      <Link to="/expense/setup">Setup</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/vendors")}> 
                      <Link to="/vendors">Vendors</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/expense/purchase")}>
                      <Link to="/expense/purchase">Purchase Workflow</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/expense/invoices")}>
                      <Link to="/expense/invoices">Invoice Accounting</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/expense/payment")}>
                      <Link to="/expense/payment">Payment Workflow</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
            v1.0
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="text-sm text-muted-foreground">Expense Module</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  aria-label="Search"
                  className="h-9 w-56 rounded-md border bg-background pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Search"
                />
              </div>
              <div aria-label="Profile" className="grid size-9 place-items-center rounded-full bg-muted">
                <User2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </header>
          <main className={cn("p-0 flex-1 overflow-auto", "w-full")}>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
