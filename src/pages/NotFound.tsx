import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Database, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "404 - Page Not Found | SQL Formatter";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="glass-card max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Database className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-extrabold text-gradient">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Oops! Page not found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <button onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </Button>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">You might be interested in:</p>
          <ul className="text-sm space-y-2">
            <li>
              <Link to="/" className="text-primary hover:underline">Free SQL Formatter Tool</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
