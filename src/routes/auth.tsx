import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "تسجيل الدخول | صفقة" },
    { name: "description", content: "سجّل الدخول إلى حساب صفقة." },
    { property: "og:title", content: "تسجيل الدخول | صفقة" },
    { property: "og:description", content: "سجّل الدخول إلى حساب صفقة." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
  component: AuthPage,
});

const schema = z.object({ email: z.string().email("البريد غير صحيح"), password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل") });

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) { toast.error("بيانات الدخول غير صحيحة"); return; }
    await navigate({ to: "/admin" });
  }
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md rounded-xl border border-border bg-card/60 p-6 backdrop-blur-xl sm:p-8"><Link to="/" className="mb-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Handshake /></span><span className="font-display text-xl">صفقة</span></Link><span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldCheck /></span><h1 className="font-display text-3xl">دخول الإدارة</h1><p className="mt-2 text-muted-foreground">هذه الصفحة مخصصة لإدارة صفقة.</p><form onSubmit={submit} className="mt-7 space-y-4"><Input name="email" type="email" required autoComplete="username" placeholder="البريد الإلكتروني" /><Input name="password" type="password" required minLength={8} autoComplete="current-password" placeholder="كلمة المرور" /><Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>{loading ? "يرجى الانتظار" : "دخول الإدارة"}</Button></form><Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">العودة إلى الواجهة</Link></div></main>;
}