import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AppShell } from "@/components/AppShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppShell>
      <div className="rounded-lg border bg-white p-12 text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="mt-4 inline-block text-primary underline">
          Return to Home
        </a>
      </div>
    </AppShell>
  );
};

export default NotFound;
