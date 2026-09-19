import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "استعادة كلمة المرور | صفقة" }, { name: "description", content: "استعادة كلمة مرور حساب صفقة." }, { property: "og:title", content: "استعادة كلمة المرور | صفقة" }, { property: "og:description", content: "استعادة كلمة مرور حساب صفقة." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [recovery] = useState(() => typeof window !== "undefined" && window.location.hash.includes("type=recovery"));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get(recovery ? "password" : "email") ?? "");
    if (recovery) {
      if (value.length < 8) return toast.error("كلمة المرور 8 أحرف على الأقل");
      const { error } = await supabase.auth.updateUser({ password: value });
      return error ? toast.error(error.message) : toast.success("تم تحديث كلمة المرور");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(value, { redirectTo: `${window.location.origin}/reset-password` });
    return error ? toast.error(error.message) : toast.success("أرسلنا رابط الاستعادة إلى بريدك");
  }
  return <main className="grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="w-full max-w-md rounded-xl border border-border bg-card p-7"><h1 className="font-display text-3xl">{recovery ? "كلمة مرور جديدة" : "استعادة الحساب"}</h1><p className="mt-2 text-muted-foreground">{recovery ? "اختر كلمة مرور قوية لحسابك" : "سنرسل لك رابطاً آمناً عبر البريد"}</p><Input className="mt-6" name={recovery ? "password" : "email"} type={recovery ? "password" : "email"} required placeholder={recovery ? "كلمة المرور الجديدة" : "البريد الإلكتروني"} /><Button className="mt-4 w-full" variant="hero" size="lg">{recovery ? "حفظ كلمة المرور" : "إرسال الرابط"}</Button></form></main>;
}