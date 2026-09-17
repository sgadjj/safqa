import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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

const schema = z.object({ email: z.string().email("البريد غير صحيح"), password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"), displayName: z.string().trim().min(2).max(80).optional() });

function AuthPage() {
  const [signup, setSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = schema.safeParse({ ...values, displayName: signup ? values.displayName : undefined });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
    setLoading(true);
    if (signup) {
      const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: window.location.origin, data: { display_name: parsed.data.displayName } } });
      setLoading(false);
      if (error) return toast.error(error.message);
      if (!data.session) return toast.success("تحقق من بريدك لتأكيد الحساب");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (error) { setLoading(false); return toast.error("بيانات الدخول غير صحيحة"); }
      await supabase.from("profiles").upsert({ id: data.user.id, display_name: String(data.user.user_metadata.display_name ?? parsed.data.email.split("@")[0]) }, { onConflict: "id" });
      setLoading(false);
      await navigate({ to: "/admin" });
    }
  }
  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("تعذر تسجيل الدخول عبر Google");
  }
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md rounded-xl border border-border bg-card/60 p-6 backdrop-blur-xl sm:p-8"><Link to="/" className="mb-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Handshake /></span><span className="font-display text-xl">صفقة</span></Link><h1 className="font-display text-3xl">{signup ? "أنشئ حسابك" : "أهلاً بعودتك"}</h1><p className="mt-2 text-muted-foreground">{signup ? "ابدأ تجربتك مع صفقة" : "ادخل لمتابعة حسابك ورسائلك"}</p><form onSubmit={submit} className="mt-7 space-y-4">{signup && <Input name="displayName" required placeholder="الاسم الظاهر" />}<Input name="email" type="email" required placeholder="البريد الإلكتروني" /><Input name="password" type="password" required minLength={8} placeholder="كلمة المرور" /><Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>{loading ? "يرجى الانتظار" : signup ? "إنشاء حساب" : "تسجيل الدخول"}</Button></form><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />أو<span className="h-px flex-1 bg-border" /></div><Button type="button" variant="glass" size="lg" className="w-full" onClick={google}><Mail />المتابعة عبر Google</Button><div className="mt-6 flex justify-between text-sm"><button type="button" className="text-primary" onClick={() => setSignup(!signup)}>{signup ? "لديك حساب؟ ادخل" : "مستخدم جديد؟ سجّل"}</button><Link to="/reset-password" className="text-muted-foreground hover:text-foreground">نسيت كلمة المرور؟</Link></div></div></main>;
}