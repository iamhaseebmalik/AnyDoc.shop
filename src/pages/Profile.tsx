import { Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle().then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading profile"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (error) toast.error("Failed to sign out");
    setIsSigningOut(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileCheck className="h-5 w-5" /></div>
            <span className="font-heading text-xl font-bold">AnyDoc</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-5 py-8">
        <h1 className="font-heading text-3xl">Profile</h1>
        <div className="mt-8 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></div>
          <div className="min-w-0">
            <h2 className="break-words text-lg">{user?.user_metadata?.full_name || "Your account"}</h2>
            <p className="mt-1 break-all text-sm text-muted-foreground">{user?.email?.endsWith("@telegram.anydoc.local") ? `@${user.email.split("@")[0]}` : user?.email}</p>
          </div>
        </div>
        {isAdmin && <Button asChild variant="outline" className="mt-6 w-full justify-start px-3"><Link to="/admin"><ShieldCheck className="h-4 w-4" />Admin dashboard</Link></Button>}
        <Button variant="ghost" className="mt-6 w-full justify-start px-3 text-destructive hover:text-destructive" onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut className="h-4 w-4" />{isSigningOut ? "Signing out…" : "Sign Out"}
        </Button>
      </main>
    </div>
  );
}