import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Plus, RefreshCw, X } from "lucide-react";

type Pkg = { code: string; name: string; description: string; price_usd: number; credits: number; duration_days: number; enabled: boolean };
type Order = { id: string; package_code: string; price_usd: number; status: string; telegram_username: string | null; created_at: string; fulfilled_at: string | null; invoice_url: string | null };
type U = { user_id: string; email: string | null; name: string | null; telegram: string | null; created_at: string; last_sign_in: string | null; blocked: boolean; credits: number; expires_at: string | null };

async function call<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-api", { body });
  if (error) {
    let msg = error.message;
    try { const j = await (error as { context?: Response }).context?.json(); if (j?.error) msg = typeof j.error === "string" ? j.error : "Please check the fields"; } catch { /* keep message */ }
    throw new Error(msg);
  }
  return data as T;
}

const date = (s: string | null) => (s ? new Date(s).toLocaleString() : "—");

function PackageCard({ pkg, onSaved, isNew }: { pkg: Pkg; onSaved: () => void; isNew?: boolean }) {
  const [p, setP] = useState(pkg);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { await call({ action: "savePackage", ...p, price_usd: Number(p.price_usd), credits: Number(p.credits), duration_days: Number(p.duration_days) }); toast.success("Package saved"); onSaved(); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        {isNew ? <Input placeholder="code (e.g. weekly)" value={p.code} onChange={e => setP({ ...p, code: e.target.value.toLowerCase() })} className="max-w-[200px]" />
          : <span className="font-mono text-xs text-muted-foreground">{p.code}</span>}
        <label className="flex items-center gap-2 text-sm">On sale <Switch checked={p.enabled} onCheckedChange={v => setP({ ...p, enabled: v })} /></label>
      </div>
      <Input placeholder="Name" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
      <Textarea placeholder="Description shown to buyers" value={p.description} onChange={e => setP({ ...p, description: e.target.value })} rows={2} />
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs text-muted-foreground">Price (USD)<Input type="number" step="0.01" value={p.price_usd} onChange={e => setP({ ...p, price_usd: e.target.value as unknown as number })} /></label>
        <label className="text-xs text-muted-foreground">Credits<Input type="number" value={p.credits} onChange={e => setP({ ...p, credits: e.target.value as unknown as number })} /></label>
        <label className="text-xs text-muted-foreground">Days<Input type="number" value={p.duration_days} onChange={e => setP({ ...p, duration_days: e.target.value as unknown as number })} /></label>
      </div>
      <Button onClick={save} disabled={busy} className="w-full">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
    </div>
  );
}

function UserRow({ u, onChanged }: { u: U; onChanged: () => void }) {
  const [credits, setCredits] = useState(u.credits);
  const [exp, setExp] = useState(u.expires_at ? u.expires_at.slice(0, 10) : "");
  const run = async (body: Record<string, unknown>, ok: string) => {
    try { await call(body); toast.success(ok); onChanged(); } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{u.telegram ? `@${u.telegram}` : u.name || u.email}</p>
          <p className="text-xs text-muted-foreground truncate">{u.email} · joined {date(u.created_at)} · last sign-in {date(u.last_sign_in)}</p>
        </div>
        {u.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary">Active</Badge>}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted-foreground">Credits<Input type="number" className="w-24" value={credits} onChange={e => setCredits(Number(e.target.value))} /></label>
        <label className="text-xs text-muted-foreground">Access until<Input type="date" className="w-40" value={exp} onChange={e => setExp(e.target.value)} /></label>
        <Button size="sm" variant="outline" onClick={() => run({ action: "updateAccess", userId: u.user_id, credits, expires_at: exp ? new Date(exp + "T23:59:59Z").toISOString() : null }, "Access updated")}>Save access</Button>
        <Button size="sm" variant={u.blocked ? "secondary" : "destructive"} onClick={() => run({ action: "setBlocked", userId: u.user_id, blocked: !u.blocked }, u.blocked ? "User unblocked" : "User blocked")}>{u.blocked ? "Unblock" : "Block"}</Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAuthenticated, loading } = useAuth();
  const [data, setData] = useState<{ packages: Pkg[]; orders: Order[]; users: U[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyOrder, setBusyOrder] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setData(await call({ action: "overview" })); setError(null); } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const orderAction = async (action: string, orderId: string, ok: string) => {
    setBusyOrder(orderId);
    try { await call({ action, orderId }); toast.success(ok); load(); } catch (e) { toast.error((e as Error).message); } finally { setBusyOrder(null); }
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated || error === "Admin access only" || error === "Sign in required")
    return <div className="min-h-screen grid place-items-center p-6 text-center"><div className="space-y-3"><h1 className="font-display text-2xl">Admin access only</h1><Button asChild variant="outline"><Link to="/">Back</Link></Button></div></div>;

  const pending = data?.orders.filter(o => !o.fulfilled_at && o.status !== "rejected") ?? [];
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Button asChild size="icon" variant="ghost"><Link to="/editor"><ArrowLeft className="h-4 w-4" /></Link></Button><h1 className="font-display text-xl">AnyDoc Admin</h1></div>
        <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        {error && <p className="text-destructive mb-4">{error}</p>}
        {!data ? <Loader2 className="animate-spin mx-auto mt-10" /> : (
          <Tabs defaultValue="orders">
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Payments {pending.length > 0 && <Badge className="ml-2">{pending.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="users">Users ({data.users.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-2">
              {data.orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
              {data.orders.map(o => (
                <div key={o.id} className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{o.telegram_username ? `@${o.telegram_username}` : "Unknown"} · {o.package_code} · ${Number(o.price_usd).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Ordered {date(o.created_at)}{o.fulfilled_at && ` · approved ${date(o.fulfilled_at)}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={o.status === "fulfilled" ? "default" : o.status === "rejected" ? "destructive" : "secondary"}>{o.status === "fulfilled" ? "Paid & approved" : o.status}</Badge>
                    {!o.fulfilled_at && o.status !== "rejected" && <>
                      <Button size="sm" disabled={busyOrder === o.id} onClick={() => confirm("Confirm you received this payment? The user will get their sign-in details on Telegram.") && orderAction("approveOrder", o.id, "Approved — credentials sent")}><Check className="h-4 w-4" /> Approve</Button>
                      <Button size="sm" variant="outline" disabled={busyOrder === o.id} onClick={() => orderAction("rejectOrder", o.id, "Order rejected")}><X className="h-4 w-4" /></Button>
                    </>}
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="packages">
              <div className="grid gap-3 md:grid-cols-2">
                {data.packages.map(p => <PackageCard key={p.code + p.name + p.price_usd} pkg={{ ...p, description: p.description ?? "" }} onSaved={load} />)}
                {adding ? <PackageCard isNew pkg={{ code: "", name: "", description: "", price_usd: 5, credits: 0, duration_days: 0, enabled: false }} onSaved={() => { setAdding(false); load(); }} />
                  : <Button variant="outline" className="h-auto min-h-32 border-dashed" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New package</Button>}
              </div>
            </TabsContent>
            <TabsContent value="users" className="space-y-2">
              {data.users.map(u => <UserRow key={u.user_id + u.credits + u.blocked + u.expires_at} u={u} onChanged={load} />)}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
