import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, ArrowLeft, FileText, Calendar, Trash2 } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditingHistoryItem {
  id: string;
  document_name: string;
  document_type: string | null;
  edited_fields: unknown;
  created_at: string;
}

export default function History() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [history, setHistory] = useState<EditingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("editing_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load editing history");
    } else {
      setHistory(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("editing_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      setHistory(history.filter(item => item.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AnyDoc</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/editor")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editing History</h1>
              <p className="text-muted-foreground">View your past document edits</p>
            </div>
          </div>

          {history.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No editing history yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start editing documents to see your history here
                </p>
                <Button onClick={() => navigate("/editor")}>
                  Start Editing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.document_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            editing history entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  {item.document_type && (
                    <CardContent className="pt-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {item.document_type}
                      </span>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
