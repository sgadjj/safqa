import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Handshake, Inbox, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة | صفقة" }, { name: "description", content: "إدارة رسائل دعم صفقة." }, { property: "og:title", content: "لوحة الإدارة | صفقة" }, { property: "og:description", content: "إدارة رسائل دعم صفقة." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AdminPage,
});

type Message = { id: string; sender_name: string; sender_email: string; subject: string; message: string; status: "new" | "in_progress" | "resolved"; created_at: string };

function AdminPage() {
  const { user } = Route.useRouteContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();
  async function load() {
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const allowed = Boolean(role);
    setAdmin(allowed);
    if (!allowed) return;
    const { data, error } = await supabase.from("support_messages").select("id,sender_name,sender_email,subject,message,status,created_at").order("created_at", { ascending: false });
    if (error) toast.error("تعذر تحميل الرسائل"); else setMessages((data ?? []) as Message[]);
  }
  useEffect(() => { void load(); }, []);
  async function setStatus(id: string, status: Message["status"]) {
    const { error } = await supabase.from("support_messages").update({ status }).eq("id", id);
    if (error) {
      toast.error("تعذر تحديث الحالة");
      return;
    }
    setMessages((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }
  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  if (admin === null) return <main className="grid min-h-screen place-items-center"><RefreshCw className="animate-spin text-primary" /></main>;
  if (!admin) return <main className="grid min-h-screen place-items-center px-5 text-center"><div><Handshake className="mx-auto size-12 text-primary" /><h1 className="mt-5 font-display text-3xl">حساب مستخدم</h1><p className="mt-3 text-muted-foreground">هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.</p><Link to="/" className="mt-6 inline-block text-primary">العودة للرئيسية</Link></div></main>;
  const counts = { new: messages.filter(m => m.status === "new").length, progress: messages.filter(m => m.status === "in_progress").length, resolved: messages.filter(m => m.status === "resolved").length };
  return <main className="min-h-screen"><header className="border-b border-border"><div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5"><Link to="/" className="flex items-center gap-2 font-display"><Handshake className="text-primary" />صفقة | الإدارة</Link><Button variant="ghost" onClick={signOut}><LogOut />خروج</Button></div></header><div className="mx-auto max-w-[1200px] px-5 py-10"><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-primary">مركز الدعم</p><h1 className="font-display text-4xl">رسائل المستخدمين</h1></div><Button variant="glass" size="icon" onClick={load} aria-label="تحديث"><RefreshCw /></Button></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{[[Inbox,"جديدة",counts.new],[Clock3,"قيد المتابعة",counts.progress],[CheckCircle2,"محلولة",counts.resolved]].map(([Icon,label,count]) => { const I = Icon as typeof Inbox; return <div key={String(label)} className="rounded-lg border border-border bg-card p-5"><I className="text-primary" /><div className="mt-4 text-3xl font-bold">{String(count)}</div><div className="text-sm text-muted-foreground">{String(label)}</div></div>})}</div><div className="mt-8 space-y-4">{messages.length === 0 ? <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">لا توجد رسائل حالياً</div> : messages.map(message => <article key={message.id} className="rounded-lg border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-lg">{message.subject}</h2><p className="text-sm text-muted-foreground">{message.sender_name} · {message.sender_email}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{message.status === "new" ? "جديدة" : message.status === "in_progress" ? "قيد المتابعة" : "محلولة"}</span></div><p className="mt-4 whitespace-pre-wrap leading-7 text-foreground/80">{message.message}</p><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="glass" onClick={() => setStatus(message.id,"in_progress")}><Clock3 />قيد المتابعة</Button><Button size="sm" variant="hero" onClick={() => setStatus(message.id,"resolved")}><CheckCircle2 />تم الحل</Button></div></article>)}</div></div></main>;
}