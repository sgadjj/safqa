import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownToLine,
  Building2,
  CarFront,
  ChevronLeft,
  ChevronRight,
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
  { src: appShowcase, alt: "واجهة تطبيق صفقة لطلب وشراء هاتف", label: "بيع وشراء الأجهزة" },
  { src: showcaseCar, alt: "محادثة صفقة لطلب قطعة غيار سيارة", label: "قطع السيارات" },
  { src: showcaseFood, alt: "محادثة صفقة لطلب بيتزا من مطعم", label: "المطاعم" },
  { src: showcaseHome, alt: "محادثة صفقة لعرض شقة للإيجار", label: "العقارات" },
  { src: showcaseServices, alt: "محادثة صفقة لطلب كهربائي وفني بناء", label: "الصيانة والبناء" },
];

function Index() {
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const logoPressTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const navigate = useNavigate();
  const fetchDownload = useServerFn(getAppDownload);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % gallery.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  function openAdmin() {
    void navigate({ to: "/auth" });
  }

  function beginLogoPress() {
    logoPressTimer.current = window.setTimeout(openAdmin, 900);
  }

  function cancelLogoPress() {
    if (logoPressTimer.current !== null) window.clearTimeout(logoPressTimer.current);
    logoPressTimer.current = null;
  }

  function moveSlide(direction: number) {
    setActiveSlide((current) => (current + direction + gallery.length) % gallery.length);
  }

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
        <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-3 px-0 hover:bg-transparent"
            aria-label="صفقة"
            onClick={(event) => {
              if (event.detail >= 3) openAdmin();
            }}
            onPointerDown={beginLogoPress}
            onPointerUp={cancelLogoPress}
            onPointerLeave={cancelLogoPress}
            onPointerCancel={cancelLogoPress}
          >
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Handshake className="size-5" />
            </span>
            <span className="font-display text-xl">صفقة</span>
          </Button>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="التنقل الرئيسي">
            <a href="#services" className="transition-colors hover:text-foreground">الخدمات</a>
            <a href="#gallery" className="transition-colors hover:text-foreground">من داخل التطبيق</a>
            <a href="#steps" className="transition-colors hover:text-foreground">كيف تعمل</a>
          </nav>
          <Button variant="glass" size="sm" onClick={download} disabled={loading}>
            <ArrowDownToLine /> تحميل
          </Button>
        </header>

        <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-20 pt-5 sm:px-8 lg:pt-8">
          <div
            className="relative mx-auto mb-10 min-h-[420px] max-w-[780px] overflow-hidden sm:min-h-[560px]"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStartX.current;
              const end = event.changedTouches[0]?.clientX;
              touchStartX.current = null;
              if (start === null || end === undefined || Math.abs(start - end) < 45) return;
              moveSlide(end < start ? 1 : -1);
            }}
          >
            {gallery.map((item, index) => (
              <figure
                key={item.label}
                aria-hidden={index !== activeSlide}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${index === activeSlide ? "translate-x-0 opacity-100" : index < activeSlide ? "translate-x-full opacity-0" : "-translate-x-full opacity-0"}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  width={912}
                  height={1200}
                  className="h-[370px] w-auto animate-floaty object-contain sm:h-[510px]"
                />
                <figcaption className="mt-2 font-display text-sm text-foreground">{item.label}</figcaption>
              </figure>
            ))}
            <Button type="button" variant="glass" size="icon" className="absolute right-0 top-1/2 z-10 -translate-y-1/2" onClick={() => moveSlide(-1)} aria-label="الصورة السابقة">
              <ChevronRight />
            </Button>
            <Button type="button" variant="glass" size="icon" className="absolute left-0 top-1/2 z-10 -translate-y-1/2" onClick={() => moveSlide(1)} aria-label="الصورة التالية">
              <ChevronLeft />
            </Button>
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-2" aria-label="اختيار صورة">
              {gallery.map((item, index) => (
                <Button
                  key={item.label}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40"}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`عرض ${item.label}`}
                />
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-4xl animate-rise text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" /> وكيلك الذكي لكل صفقة وخدمة
            </div>
            <h1 className="font-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
              اطلب. بِع. اشترِ.<br />
              <span className="text-primary">وخلِّ الباقي على صفقة</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              صفقة وكيلك الذكي للوصول إلى ما تحتاجه بدقة: بيع وشراء السيارات والأجهزة، قطع الغيار، العقارات، الطعام،
              الكهرباء، البناء، الصيانة، ومختلف الخدمات. اكتب طلبك كما تفكر به، ودع صفقة يرتّب التفاصيل ويقرّبك من العرض الأنسب.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4" id="download">
              <Button variant="hero" size="lg" onClick={download} disabled={loading}>
                <ArrowDownToLine /> {loading ? "جارٍ التجهيز" : "حمّل التطبيق"}
              </Button>
              <span className="font-mono text-xs text-muted-foreground">
                Android APK <span className="mx-2 text-primary">•</span> مباشر من صفقة
              </span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
              <div><strong className="block font-display text-foreground">وضوح</strong>يفهم طلبك وتفاصيله</div>
              <div><strong className="block font-display text-foreground">اختيار</strong>يقارن الفرص المناسبة</div>
              <div><strong className="block font-display text-foreground">إنجاز</strong>يوصلك إلى صفقتك أسرع</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" /> كل ما تبحث عنه في مكان واحد</span>
              <h2 className="font-display text-3xl sm:text-4xl">من سيارة وعقار إلى أبسط خدمة يومية</h2>
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

      <section id="steps" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 font-display text-3xl sm:text-4xl">ثلاث خطوات لأي طلب</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
               ["01", "قل لنا ماذا تريد", "اكتب طلبك أو أرسل صورة وحدد المدينة والميزانية والتفاصيل المهمة."],
               ["02", "دع صفقة يبحث بدلاً عنك", "ينظّم وكيلك الطلب ويقرّبك من البائع أو المشتري أو مقدم الخدمة المناسب."],
               ["03", "اختر وأنهِ الاتفاق", "راجع التفاصيل، تواصل مباشرة، وأتم البيع أو الشراء أو الخدمة بوضوح."],
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
