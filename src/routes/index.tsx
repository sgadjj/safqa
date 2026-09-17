import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, BadgeCheck, Handshake, Headphones, MessageCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import appShowcase from "@/assets/safqa-app-showcase.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "صفقة | بيع وشراء الأجهزة بالمحادثة" },
    { name: "description", content: "حمّل صفقة واعرض جهازك أو ابحث عن جهازك القادم، وتواصل مع الدعم مباشرة." },
    { property: "og:title", content: "صفقة | بيع وشراء الأجهزة بالمحادثة" },
    { property: "og:description", content: "منصة عراقية سهلة لبيع وشراء الأجهزة بالمحادثة." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

const supportSchema = z.object({
  sender_name: z.string().trim().min(2, "اكتب اسمك").max(80),
  sender_email: z.string().trim().email("أدخل بريداً صحيحاً").max(255),
  subject: z.string().trim().min(3, "اكتب موضوع الرسالة").max(120),
  message: z.string().trim().min(10, "اكتب تفاصيل أكثر").max(2000),
});

function Index() {
  const [sending, setSending] = useState(false);

  async function submitSupport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = supportSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setSending(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.from("support_messages").insert({
      ...parsed.data,
      user_id: sessionData.session?.user.id ?? null,
    });
    setSending(false);
    if (error) {
      toast.error("تعذر إرسال الرسالة، حاول مرة أخرى");
      return;
    }
    form.reset();
    toast.success("وصلت رسالتك إلى فريق الدعم");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[42rem] rounded-full bg-primary/10 blur-[130px]" />
        <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="صفقة - الرئيسية">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Handshake className="size-5" /></span>
            <span className="font-display text-xl">صفقة</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="التنقل الرئيسي">
            <a href="#features" className="transition-colors hover:text-foreground">المزايا</a>
            <a href="#steps" className="transition-colors hover:text-foreground">كيف تعمل</a>
            <a href="#support" className="transition-colors hover:text-foreground">الدعم</a>
          </nav>
          <Link to="/auth" className="text-sm font-semibold text-primary hover:text-primary/80">تسجيل الدخول</Link>
        </header>

        <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pt-14">
          <div className="animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />بيع وشراء بالمحادثة</div>
            <h1 className="font-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">صفقة<br /><span className="text-primary">تُغلق بمصافحة</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">اعرض جهازك أو ابحث عن جهازك القادم، واتفقا داخل محادثة واحدة واضحة. تجربة عراقية سهلة، سريعة، وقريبة منك.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4" id="download">
              <Button variant="hero" size="lg" onClick={() => toast.info("أرسل رابط التطبيق لنربطه بزر التحميل") }><ArrowDownToLine /> حمّل التطبيق</Button>
              <span className="font-mono text-xs text-muted-foreground">Android · iOS <span className="mx-2 text-primary">•</span> قريباً</span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
              <div><strong className="block font-display text-foreground">محادثة</strong>تفاوض مباشر</div>
              <div><strong className="block font-display text-foreground">توثيق</strong>اتفاق واضح</div>
              <div><strong className="block font-display text-foreground">دعم</strong>متابعة سريعة</div>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="pointer-events-none absolute inset-x-10 bottom-4 h-24 rounded-full bg-primary/15 blur-3xl" />
            <img src={appShowcase} alt="واجهة تطبيق صفقة تعرض محادثة بيع جهاز" className="relative mx-auto w-full max-w-[430px] animate-floaty object-contain" />
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex items-end justify-between"><h2 className="font-display text-3xl sm:text-4xl">لماذا صفقة</h2><span className="font-mono text-xs text-muted-foreground">المزايا</span></div>
          <div className="grid gap-5 md:grid-cols-3">
            {[[ShieldCheck,"أمان موثوق","سجل واضح لكل اتفاق يساعد الطرفين على إتمام الصفقة بثقة."],[MessageCircle,"سهولة المحادثة","السؤال والتفاوض والاتفاق في مكان واحد دون خطوات معقدة."],[Headphones,"دعم مباشر","أرسل مشكلتك لفريق الدعم وتابع حالتها حتى يتم حلها."]].map(([Icon,title,text]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return <article key={String(title)} className="rounded-xl border border-border bg-card/45 p-7 backdrop-blur-xl"><span className="mb-5 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><FeatureIcon /></span><h3 className="font-display text-lg">{String(title)}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{String(text)}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section id="steps" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 font-display text-3xl sm:text-4xl">ثلاث خطوات لصفقتك</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[["01","اكتب طلبك","صف الجهاز والسعر والمدينة بكلمات بسيطة."],["02","استلم المطابقة","يعثر التطبيق على الطرف المناسب لطلبك."],["03","أغلق الصفقة","تواصل واتفق ثم أكد إتمام الصفقة."]].map(([n,t,d]) => <article key={n} className="rounded-xl border border-border bg-card p-7"><span className="font-mono text-3xl text-primary/70">{n}</span><h3 className="mt-5 font-display text-lg">{t}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p></article>)}
          </div>
        </div>
      </section>

      <section id="support" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div><span className="mb-4 inline-flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" /> فريق صفقة</span><h2 className="font-display text-3xl sm:text-4xl">الدعم في صفّك</h2><p className="mt-4 max-w-md text-lg leading-8 text-muted-foreground">اكتب رسالتك هنا لتصل مباشرة إلى لوحة الإدارة، وسيتابعها الفريق من حالة جديدة حتى الحل.</p></div>
          <form onSubmit={submitSupport} className="grid gap-4 rounded-xl border border-border bg-card/55 p-6 backdrop-blur-xl sm:grid-cols-2">
            <Input name="sender_name" required maxLength={80} placeholder="الاسم" aria-label="الاسم" />
            <Input name="sender_email" required type="email" maxLength={255} placeholder="البريد الإلكتروني" aria-label="البريد الإلكتروني" />
            <Input name="subject" required maxLength={120} placeholder="موضوع الرسالة" aria-label="موضوع الرسالة" className="sm:col-span-2" />
            <Textarea name="message" required minLength={10} maxLength={2000} placeholder="اكتب تفاصيل طلبك..." aria-label="تفاصيل طلب الدعم" className="min-h-32 sm:col-span-2" />
            <div className="flex items-center justify-between gap-4 sm:col-span-2"><span className="text-xs text-muted-foreground"><BadgeCheck className="ml-1 inline size-4 text-primary" />تصل إلى فريق الإدارة</span><Button type="submit" variant="hero" disabled={sending}><Send />{sending ? "جارٍ الإرسال" : "إرسال"}</Button></div>
          </form>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8"><div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row"><span className="font-display text-foreground">صفقة</span><span>منصة بيع وشراء الأجهزة بالمحادثة</span><span className="font-mono text-xs">© 2026</span></div></footer>
    </div>
  );
}
