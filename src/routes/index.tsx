import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownToLine,
  Building2,
  CarFront,
  Handshake,
  Hammer,
  MessagesSquare,
  Pizza,
  Plug,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SupportChat } from "@/components/support-chat";
import { getAppDownload } from "@/lib/storage.functions";
import appShowcase from "@/assets/safqa-app-showcase.png";
import showcaseCar from "@/assets/showcase-car-parts.png";
import showcaseFood from "@/assets/showcase-food.png";
import showcaseHome from "@/assets/showcase-realestate.png";
import showcaseServices from "@/assets/showcase-services.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صفقة | وكيل خدماتك في العراق" },
      {
        name: "description",
        content:
          "صفقة وكيل خدمات شامل: أجهزة، قطع سيارات، عقارات، مطاعم، كهرباء وبناء. اطلب أي خدمة بمحادثة واحدة.",
      },
      { property: "og:title", content: "صفقة | وكيل خدماتك في العراق" },
      {
        property: "og:description",
        content: "اطلب أي خدمة أو منتج بمحادثة واحدة: قطع سيارات، عقارات، طعام، صيانة وأجهزة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: CarFront, title: "قطع غيار السيارات", text: "اطلب القطعة بالصورة والموديل ونصلك بأقرب مجهز موثوق." },
  { icon: Building2, title: "العقارات", text: "بيع، شراء، أو إيجار شقة وأرض ومحل مع تفاصيل واضحة وصور." },
  { icon: Pizza, title: "المطاعم والطعام", text: "اطلب وجبتك من مطاعم منطقتك وتابع طلبك حتى الباب." },
  { icon: Plug, title: "الكهرباء والصيانة", text: "كهربائي، سبّاك، تكييف وتصليح أجهزة بموعد يناسبك." },
  { icon: Hammer, title: "البناء والمقاولات", text: "مواد بناء، عمال، وتنفيذ أعمال بعرض سعر قبل البدء." },
  { icon: Smartphone, title: "الأجهزة والإلكترونيات", text: "هواتف، حاسبات وأجهزة منزلية جديدة ومستعملة." },
];

const gallery = [
  { src: showcaseCar, alt: "محادثة صفقة لطلب قطعة غيار سيارة", label: "قطع السيارات" },
  { src: showcaseFood, alt: "محادثة صفقة لطلب بيتزا من مطعم", label: "المطاعم" },
  { src: showcaseHome, alt: "محادثة صفقة لعرض شقة للإيجار", label: "العقارات" },
  { src: showcaseServices, alt: "محادثة صفقة لطلب كهربائي وفني بناء", label: "الصيانة والبناء" },
];

function Index() {
  const [loading, setLoading] = useState(false);
  const fetchDownload = useServerFn(getAppDownload);

  async function download() {
    setLoading(true);
    try {
      const result = await fetchDownload({});
      if (!result.url) {
        toast.info("ملف التطبيق سيُرفع قريباً من لوحة الإدارة");
        return;
      }
      window.location.href = result.url;
    } catch {
      toast.error("تعذر تحميل التطبيق الآن");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[42rem] rounded-full bg-primary/10 blur-[130px]" />
        <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="صفقة - الرئيسية">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Handshake className="size-5" />
            </span>
            <span className="font-display text-xl">صفقة</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="التنقل الرئيسي">
            <a href="#services" className="transition-colors hover:text-foreground">الخدمات</a>
            <a href="#gallery" className="transition-colors hover:text-foreground">من داخل التطبيق</a>
            <a href="#steps" className="transition-colors hover:text-foreground">كيف تعمل</a>
          </nav>
          <Button variant="glass" size="sm" onClick={download} disabled={loading}>
            <ArrowDownToLine /> تحميل
          </Button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pt-14">
          <div className="animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />وكيل خدمات شامل
            </div>
            <h1 className="font-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
              كل خدمة تحتاجها<br />
              <span className="text-primary">بمحادثة واحدة</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              صفقة ليست للأجهزة فقط. اطلب قطعة غيار لسيارتك، ابحث عن شقة، احجز كهربائياً أو فني بناء، واطلب وجبتك من
              مطعمك المفضل — كل ذلك داخل محادثة عربية بسيطة وواضحة.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4" id="download">
              <Button variant="hero" size="lg" onClick={download} disabled={loading}>
                <ArrowDownToLine /> {loading ? "جارٍ التجهيز" : "حمّل التطبيق"}
              </Button>
              <span className="font-mono text-xs text-muted-foreground">
                Android APK <span className="mx-2 text-primary">•</span> مباشر من صفقة
              </span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
              <div><strong className="block font-display text-foreground">طلب</strong>صف حاجتك بكلماتك</div>
              <div><strong className="block font-display text-foreground">مطابقة</strong>نصلك بالمزوّد المناسب</div>
              <div><strong className="block font-display text-foreground">تنفيذ</strong>اتفاق وتسليم واضح</div>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="pointer-events-none absolute inset-x-10 bottom-4 h-24 rounded-full bg-primary/15 blur-3xl" />
            <img
              src={appShowcase}
              alt="واجهة تطبيق صفقة تعرض محادثة خدمة"
              width={912}
              height={1200}
              className="relative mx-auto w-full max-w-[430px] animate-floaty object-contain"
            />
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" /> وكيل خدمات</span>
              <h2 className="font-display text-3xl sm:text-4xl">خدماتنا تغطي حياتك اليومية</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">وكل خدمة أخرى تطلبها</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl border border-border bg-card/45 p-7 backdrop-blur-xl transition-colors hover:border-primary/40">
                  <span className="mb-5 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon /></span>
                  <h3 className="font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-3 font-display text-3xl sm:text-4xl">من داخل التطبيق</h2>
          <p className="mb-12 max-w-xl text-muted-foreground">
            نفس التجربة لكل خدمة: تكتب، تشوف الصور والسعر، وتتفق — بدون تعقيد.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item, index) => (
              <figure key={item.label} className="text-center">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-x-8 bottom-2 h-16 rounded-full bg-primary/15 blur-2xl" />
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    width={912}
                    height={1200}
                    className="relative mx-auto w-full max-w-[260px] animate-floaty object-contain"
                    style={{ animationDelay: `${index * 500}ms` }}
                  />
                </div>
                <figcaption className="mt-5 font-display text-sm text-foreground">{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="steps" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 font-display text-3xl sm:text-4xl">ثلاث خطوات لأي طلب</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "اكتب طلبك", "صف الخدمة أو المنتج والسعر والمدينة بكلمات بسيطة."],
              ["02", "استلم المطابقة", "يعثر التطبيق على المزوّد أو الطرف المناسب لطلبك."],
              ["03", "أغلق الصفقة", "تواصل، اتفق، وأكد إتمام الخدمة بثقة."],
            ].map(([n, t, d]) => (
              <article key={n} className="rounded-xl border border-border bg-card p-7">
                <span className="font-mono text-3xl text-primary/70">{n}</span>
                <h3 className="mt-5 font-display text-lg">{t}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-6 sm:grid-cols-3">
          {[
            [ShieldCheck, "ثقة", "سجل واضح لكل اتفاق يحمي الطرفين."],
            [Truck, "سرعة", "مزوّدون قريبون منك وتنفيذ بأقصر وقت."],
            [MessagesSquare, "دعم مباشر", "اضغط زر المحادثة وأرسل رسالتك أو صورتك للإدارة فوراً."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <article key={String(title)} className="rounded-xl border border-border bg-card/45 p-7 backdrop-blur-xl">
                <span className="mb-5 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><I /></span>
                <h3 className="font-display text-lg">{String(title)}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{String(text)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display text-foreground">صفقة</span>
          <span>وكيل خدمات شامل بالمحادثة</span>
          <span className="font-mono text-xs">© 2026</span>
        </div>
      </footer>

      <SupportChat />
    </div>
  );
}
