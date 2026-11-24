import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Mail, Lock, Send, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { telegramLoginEmail } from "../../supabase/functions/_shared/registrationRules";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const registrationContactUrl = "https://t.me/AnyDocBot";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, loading } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Error state
  const [loginError, setLoginError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/editor");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    // Validate
    try {
      if (loginEmail.includes("@") && !loginEmail.startsWith("@")) emailSchema.parse(loginEmail.trim());
      else telegramLoginEmail(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setLoginError(err.errors[0].message);
        return;
      }
      setLoginError(err instanceof Error ? err.message : "Enter a valid username or email.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setLoginError("Invalid email or password. Please try again.");
      } else {
        setLoginError(error.message);
      }
    } else {
      toast.success("Welcome back!");
      navigate("/editor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 h-10 w-10 rounded-full glow-cyan opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-pink/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl gradient-neon flex items-center justify-center glow-sm">
                <FileCheck className="h-5 w-5 text-background" />
              </div>
            </div>
            <span className="text-xl font-heading font-bold text-foreground">AnyDoc</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <Card className="glass-panel border-white/[0.08] rounded-2xl overflow-hidden">
            {/* Neon top border */}
            <div className="h-[2px] gradient-neon" />
            
            <CardHeader className="text-center pt-8 pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-neon-cyan animate-neon-pulse" />
                <span className="text-sm font-medium text-neon-cyan">AI-Powered</span>
              </div>
              <CardTitle className="text-2xl font-heading neon-text">Welcome to AnyDoc</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Sign in to save your editing history and access your documents
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-lg font-medium transition-all duration-180 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-sm"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="rounded-lg font-medium transition-all duration-180 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-sm"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-6">
                    {loginError && (
                      <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {loginError}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm text-muted-foreground">Telegram username or email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="text"
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="Telegram username or email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 bg-secondary/50 border-white/[0.08] rounded-xl h-12 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm text-muted-foreground">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 bg-secondary/50 border-white/[0.08] rounded-xl h-12 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <a href="https://t.me/AnyDocBot" target="_blank" rel="noopener noreferrer">Recover Telegram account password</a>
                    </Button>
                  </CardContent>
                  
                  <CardFooter className="pb-6">
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl font-semibold gradient-neon text-background hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-180 glow-sm" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <CardContent className="space-y-5 pt-7 pb-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Send className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-heading">Request registration</h2>
                    <p className="text-sm text-muted-foreground">
                      Open AnyDocBot on Telegram to request an AnyDoc account.
                    </p>
                  </div>
                  {registrationContactUrl ? (
                    <Button asChild className="w-full h-12">
                      <a href={registrationContactUrl} target="_blank" rel="noopener noreferrer">
                        <Send aria-hidden="true" /> Open AnyDocBot on Telegram
                      </a>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button disabled className="w-full h-12">
                        <Send aria-hidden="true" /> Open AnyDocBot on Telegram
                      </Button>
                      <p className="text-xs text-muted-foreground">Admin contact will be available soon.</p>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-6 glass">
        <p className="text-center text-sm text-muted-foreground">
          By using AnyDoc, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
}
