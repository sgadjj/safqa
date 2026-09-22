import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownToLine,
  BadgeCheck,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Handshake,
  ClipboardCheck,
  Gauge,
  KeyRound,
  MessagesSquare,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SupportChat } from "@/components/support-chat";
import { getAppDownload } from "@/lib/storage.functions";
import showcaseMarket from "@/assets/auto-buy-sell.png";
import showcaseParts from "@/assets/auto-parts.png";
import showcaseRental from "@/assets/auto-rental.png";
import showcaseInspection from "@/assets/auto-paperwork-inspection.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صفقة | وكيلك العام لخدمات السيارات في العراق" },
      {
        name: "description",
        content:
          "صفقة وكيلك العام للسيارات: بيع وشراء، قطع غيار، تأجير، فحص، صيانة ومعاملات السيارات في العراق.",
      },
      { property: "og:title", content: "صفقة | وكيلك العام لخدمات السيارات" },
      {
        property: "og:description",
        content: "من شراء السيارة إلى قطع الغيار والمعقب والتأجير؛ صفقة يتابع طلبك ويوصلك للخيار المناسب.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: CarFront, title: "بيع وشراء السيارات", text: "حدّد النوع والموديل والميزانية، ونساعدك بالبحث والمقارنة والوصول إلى عرض جاد وواضح." },
  { icon: PackageSearch, title: "قطع الغيار والإكسسوارات", text: "أرسل رقم الشاصي أو صورة القطعة، ونبحث لك عن البديل المطابق من مصدر مناسب." },
  { icon: KeyRound, title: "تأجير السيارات", text: "سيارة يومية أو شهرية، اقتصادية أو عائلية، بخيارات تناسب مدينتك ومدة استخدامك." },
  { icon: ClipboardCheck, title: "المعقبون والمعاملات", text: "نوصلك بمعقّب لمتابعة التسجيل ونقل الملكية وتجديد السنوية والإجراءات المرتبطة بالسيارة." },
  { icon: Gauge, title: "الفحص والصيانة", text: "فحص قبل الشراء وتشخيص أعطال وصيانة دورية لدى مختصين، حتى تتخذ قرارك على بيّنة." },
  { icon: ShieldCheck, title: "الإنقاذ وخدمات الطريق", text: "سطحة، تبديل إطار، بطارية أو مساعدة طارئة؛ أرسل موقعك ونبحث عن أقرب خدمة متاحة." },
];

const gallery = [
  { src: showcaseMarket, alt: "هاتف يعرض سيارة حقيقية للبيع مع تفاصيلها", label: "بيع وشراء السيارات", note: "من أول بحث إلى المعاينة والاتفاق، نرتّب لك الخيارات الأنسب" },
  { src: showcaseParts, alt: "هاتف يعرض طلب قرص فرامل مع قطع غيار حقيقية", label: "قطع غيار مطابقة", note: "صوّر القطعة أو أرسل رقم الشاصي حتى نبحث عن المطابق" },
  { src: showcaseRental, alt: "هاتف يعرض سيارة دفع رباعي متاحة للتأجير", label: "تأجير حسب حاجتك", note: "يومي أو شهري، داخل مدينتك أو للسفر، بخيارات واضحة" },
  { src: showcaseInspection, alt: "هاتف يعرض متابعة فحص سيارة ومعاملاتها", label: "معقب وفحص سيارات", note: "معاملات وفحص قبل الشراء حتى تمشي أمورك بثقة" },
];

function Index() {
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
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
          >
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Handshake className="size-5" />
            </span>
            <span className="font-display text-xl">صفقة</span>
          </Button>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="التنقل الرئيسي">
            <a href="#services" className="transition-colors hover:text-foreground">خدمات السيارات</a>
            <a href="#gallery" className="transition-colors hover:text-foreground">من داخل التطبيق</a>
            <a href="#steps" className="transition-colors hover:text-foreground">شلون نساعدك؟</a>
          </nav>
          <Button variant="glass" size="sm" onClick={download} disabled={loading}>
            <ArrowDownToLine /> تحميل
          </Button>
        </header>

        <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-20 pt-5 sm:px-8 lg:pt-8">
          <div
            className="relative mx-auto mb-10 min-h-[500px] max-w-[880px] overflow-hidden sm:min-h-[650px]"
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
                  width={1024}
                  height={1280}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-[410px] w-full animate-floaty object-contain sm:h-[550px]"
                />
                <figcaption className="mt-1 max-w-md text-center">
                  <strong className="block font-display text-base text-foreground">{item.label}</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.note}</span>
                </figcaption>
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
              <span className="size-1.5 rounded-full bg-primary" /> وكيلك العام لكل ما يخص السيارات
            </div>
            <h1 className="font-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
              سيارتك إلها حل.<br />
              <span className="text-primary">وصفقة يتابعها وياك</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              تريد تبيع أو تشتري سيارة؟ تبحث عن قطعة غيار، معقّب، سيارة للإيجار أو فحص قبل الشراء؟
              احچي لنا شتحتاج، وصفقة يرتّب طلبك بدقة ويقرّبك من الشخص أو الخدمة المناسبة بدون دوخة البحث.
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
                <div><strong className="block font-display text-foreground">طلب واضح</strong>نوع السيارة وكل التفاصيل</div>
                <div><strong className="block font-display text-foreground">بحث أذكى</strong>خيارات مناسبة مو عشوائية</div>
                <div><strong className="block font-display text-foreground">متابعة</strong>من الطلب إلى الاتفاق</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-border px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" /> خدمات السيارة من مكان واحد</span>
              <h2 className="font-display text-3xl sm:text-4xl">من شراء السيارة إلى أصغر قطعة بيها</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">وخدمات سيارات أخرى حسب طلبك</span>
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
          <h2 className="mb-10 font-display text-3xl sm:text-4xl">أبو جاسم، الموضوع أبسط مما تتصور</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
               ["01", "احچي لنا شتحتاج", "اكتب نوع السيارة والموديل والمدينة والميزانية، أو أرسل صورة القطعة مباشرة."],
               ["02", "صفقة يتابع عنك", "نرتّب التفاصيل ونقرّبك من بائع أو مشتري أو صاحب خدمة يناسب طلبك."],
               ["03", "راجع واختار براحتك", "قارن التفاصيل وتواصل لإكمال البيع أو الشراء أو الخدمة بقرار أوضح."],
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
            [BadgeCheck, "تفاصيل أدق", "نرتّب الموديل والسنة والمواصفات قبل البحث حتى نقلّل الخيارات غير المناسبة."],
            [Truck, "خدمة أقرب", "نبحث ضمن مدينتك عن السيارة أو القطعة أو مزوّد الخدمة المناسب."],
            [MessagesSquare, "محادثة مباشرة", "أرسل طلبك وصور السيارة أو القطعة، وتابع الرد من نفس المكان."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof BadgeCheck;
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
          <span>وكيلك العام لخدمات السيارات في العراق</span>
          <span className="font-mono text-xs">© 2026</span>
        </div>
      </footer>

      <SupportChat />
    </div>
  );
}
