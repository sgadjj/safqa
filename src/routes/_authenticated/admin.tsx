import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Clock3,
  Handshake,
  ImagePlus,
  Inbox,
  LogOut,
  MessagesSquare,
  RefreshCw,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  createAdminImageUpload,
  createApkUpload,
  deleteAdminMessage,
  deleteAdminThread,
  deleteApk,
  signAdminImages,
} from "@/lib/storage.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | صفقة" },
      { name: "description", content: "إدارة محادثات دعم صفقة ورفع ملف التطبيق." },
      { property: "og:title", content: "لوحة الإدارة | صفقة" },
      { property: "og:description", content: "إدارة محادثات دعم صفقة ورفع ملف التطبيق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Thread = {
  id: string;
  guest_label: string;
  status: "new" | "in_progress" | "resolved";
  last_message_at: string;
  created_at: string;
};

type Message = {
  id: string;
  thread_id: string;
  sender: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

const statusLabel: Record<Thread["status"], string> = {
  new: "جديدة",
  in_progress: "قيد المتابعة",
  resolved: "محلولة",
};

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [apkBusy, setApkBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "message" | "thread" | "apk"; id?: string } | null>(null);
  const [apkInfo, setApkInfo] = useState<{ version: string | null; size: number | null }>({ version: null, size: null });
  const fileRef = useRef<HTMLInputElement>(null);
  const apkRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const uploadImage = useServerFn(createAdminImageUpload);
  const signImages = useServerFn(signAdminImages);
  const uploadApk = useServerFn(createApkUpload);
  const removeMessage = useServerFn(deleteAdminMessage);
  const removeThread = useServerFn(deleteAdminThread);
  const removeApk = useServerFn(deleteApk);

  const loadThreads = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id,guest_label,status,last_message_at,created_at")
      .order("last_message_at", { ascending: false });
    if (error) {
      toast.error("تعذر تحميل المحادثات");
      return;
    }
    setThreads((data ?? []) as Thread[]);
  }, []);

  const loadMessages = useCallback(
    async (threadId: string) => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,thread_id,sender,body,image_url,created_at")
        .eq("thread_id", threadId)
        .order("created_at");
      const rows = (data ?? []) as Message[];
      setMessages(rows);
      const paths = rows.map((row) => row.image_url).filter((p): p is string => Boolean(p));
      if (paths.length > 0) {
        const signed = await signImages({ data: { paths } });
        setImages(signed as Record<string, string>);
      }
    },
    [signImages],
  );

  useEffect(() => {
    void (async () => {
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      const allowed = Boolean(role);
      setAdmin(allowed);
      if (!allowed) return;
      await loadThreads();
      const { data: settings } = await supabase
        .from("app_settings")
        .select("apk_version,apk_size")
        .eq("id", true)
        .maybeSingle();
      if (settings) setApkInfo({ version: settings.apk_version, size: settings.apk_size });
    })();
  }, [user.id, loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    const timer = window.setInterval(() => void loadMessages(activeId), 6000);
    return () => window.clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function setStatus(id: string, status: Thread["status"]) {
    const { error } = await supabase.from("chat_threads").update({ status }).eq("id", id);
    if (error) {
      toast.error("تعذر تحديث الحالة");
      return;
    }
    setThreads((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function sendReply(body: string | null, imagePath: string | null) {
    if (!activeId) return;
    const { error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: activeId, sender: "admin", body, image_url: imagePath });
    if (error) {
      toast.error("تعذر إرسال الرد");
      return;
    }
    await supabase.from("chat_threads").update({ status: "in_progress" }).eq("id", activeId);
    setThreads((items) => items.map((item) => (item.id === activeId ? { ...item, status: "in_progress" } : item)));
    await loadMessages(activeId);
  }

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = reply.trim();
    if (!value || busy) return;
    setBusy(true);
    setReply("");
    await sendReply(value, null);
    setBusy(false);
  }

  async function attachImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
    setBusy(true);
    try {
      const upload = await uploadImage({ data: { ext } });
      const { error } = await supabase.storage.from("chat-images").uploadToSignedUrl(upload.path, upload.token, file);
      if (error) throw error;
      await sendReply(null, upload.path);
    } catch {
      toast.error("تعذر رفع الصورة");
    }
    setBusy(false);
  }

  async function handleApk(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".apk")) {
      toast.error("اختر ملف APK");
      return;
    }
    const version = window.prompt("رقم إصدار التطبيق (مثال 1.0.0)", apkInfo.version ?? "1.0.0");
    if (!version) return;
    setApkBusy(true);
    try {
      const upload = await uploadApk({ data: { version } });
      const { error } = await supabase.storage.from("app-downloads").uploadToSignedUrl(upload.path, upload.token, file);
      if (error) throw error;
      const { error: settingsError } = await supabase
        .from("app_settings")
        .update({ apk_url: upload.path, apk_version: version, apk_size: file.size, updated_at: new Date().toISOString() })
        .eq("id", true);
      if (settingsError) throw settingsError;
      setApkInfo({ version, size: file.size });
      toast.success("تم رفع ملف التطبيق وتفعيل زر التحميل");
    } catch {
      toast.error("تعذر رفع ملف التطبيق");
    }
    setApkBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  async function confirmDelete() {
    if (!deleteTarget || busy || apkBusy) return;
    try {
      if (deleteTarget.kind === "message" && deleteTarget.id) {
        setBusy(true);
        await removeMessage({ data: { messageId: deleteTarget.id } });
        setMessages((items) => items.filter((item) => item.id !== deleteTarget.id));
        toast.success("تم حذف الرسالة");
      }
      if (deleteTarget.kind === "thread" && deleteTarget.id) {
        setBusy(true);
        await removeThread({ data: { threadId: deleteTarget.id } });
        setThreads((items) => items.filter((item) => item.id !== deleteTarget.id));
        if (activeId === deleteTarget.id) {
          setActiveId(null);
          setMessages([]);
        }
        toast.success("تم حذف المحادثة");
      }
      if (deleteTarget.kind === "apk") {
        setApkBusy(true);
        await removeApk({});
        setApkInfo({ version: null, size: null });
        toast.success("تم حذف ملف التطبيق وإيقاف التحميل");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("تعذر إتمام الحذف");
    } finally {
      setBusy(false);
      setApkBusy(false);
    }
  }

  if (admin === null)
    return (
      <main className="grid min-h-screen place-items-center">
        <RefreshCw className="animate-spin text-primary" />
      </main>
    );

  if (!admin)
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <Handshake className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl">حساب مستخدم</h1>
          <p className="mt-3 text-muted-foreground">هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.</p>
          <Link to="/" className="mt-6 inline-block text-primary">العودة للرئيسية</Link>
        </div>
      </main>
    );

  const counts = {
    new: threads.filter((t) => t.status === "new").length,
    progress: threads.filter((t) => t.status === "in_progress").length,
    resolved: threads.filter((t) => t.status === "resolved").length,
  };
  const active = threads.find((t) => t.id === activeId) ?? null;

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-display"><span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Handshake className="size-5" /></span><span>صفقة <span className="text-muted-foreground">/ الإدارة</span></span></Link>
          <Button variant="ghost" onClick={signOut}><LogOut />خروج</Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm text-primary">مركز التحكم</p>
            <h1 className="font-display text-3xl sm:text-4xl">إدارة صفقة</h1>
            <p className="mt-2 text-sm text-muted-foreground">تابع المحادثات، أدر ملف التطبيق، وأنجز طلبات الدعم من مكان واحد.</p>
          </div>
          <Button variant="glass" size="icon" onClick={() => void loadThreads()} aria-label="تحديث"><RefreshCw /></Button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          {([
            [Inbox, "جديدة", counts.new],
            [Clock3, "قيد المتابعة", counts.progress],
            [CheckCircle2, "محلولة", counts.resolved],
            [MessagesSquare, "الكل", threads.length],
          ] as const).map(([Icon, label, count]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5">
              <Icon className="text-primary" />
              <div className="mt-4 text-3xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <section className="mt-6 border-y border-border bg-card/30 px-1 py-6 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg">ملف التطبيق (APK)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {apkInfo.version
                  ? `الإصدار الحالي ${apkInfo.version} · ${apkInfo.size ? (apkInfo.size / 1048576).toFixed(1) : "?"} ميغابايت`
                  : "لم يُرفع أي ملف بعد — زر التحميل في الواجهة ينتظر الملف."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={apkRef} type="file" accept=".apk" hidden onChange={handleApk} />
              {apkInfo.version && <Button variant="outline" disabled={apkBusy} onClick={() => setDeleteTarget({ kind: "apk" })}><Trash2 />حذف الملف</Button>}
              <Button variant="hero" disabled={apkBusy} onClick={() => apkRef.current?.click()}>
                <UploadCloud />{apkBusy ? "جارٍ التنفيذ" : apkInfo.version ? "استبدال الملف" : "رفع ملف APK"}
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-2 rounded-lg border border-border bg-card/40 p-3">
            {threads.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">لا توجد محادثات بعد</p>
            )}
            {threads.map((thread) => (
              <div key={thread.id} className={`group flex items-center gap-1 rounded-lg border p-1 transition-colors ${thread.id === activeId ? "border-primary/60 bg-primary/10" : "border-border hover:bg-secondary/50"}`}>
                <Button type="button" variant="ghost" onClick={() => setActiveId(thread.id)} className="h-auto min-w-0 flex-1 justify-start p-2 text-right hover:bg-transparent">
                  <span className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm">{thread.guest_label} · {thread.id.slice(0, 6)}</span>
                  <Badge variant={thread.status === "resolved" ? "secondary" : "default"}>{statusLabel[thread.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(thread.last_message_at).toLocaleString("ar-IQ")}
                </p>
                  </span>
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="حذف المحادثة" onClick={() => setDeleteTarget({ kind: "thread", id: thread.id })}><Trash2 /></Button>
              </div>
            ))}
          </aside>

          <section className="flex min-h-[520px] flex-col rounded-lg border border-border bg-card/40">
            {!active ? (
              <div className="grid flex-1 place-items-center p-10 text-center text-muted-foreground">
                اختر محادثة من القائمة لعرض الرسائل والرد عليها
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                  <div>
                    <h2 className="font-display text-lg">{active.guest_label} · {active.id.slice(0, 6)}</h2>
                    <p className="text-xs text-muted-foreground">بدأت {new Date(active.created_at).toLocaleDateString("ar-IQ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="glass" onClick={() => setStatus(active.id, "in_progress")}><Clock3 />قيد المتابعة</Button>
                    <Button size="sm" variant="hero" onClick={() => setStatus(active.id, "resolved")}><CheckCircle2 />تم الحل</Button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((message) => {
                    const mine = message.sender === "admin";
                    return (
                      <div key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                        <div className="group/message flex max-w-[86%] items-center gap-1 sm:max-w-[75%]">
                        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground opacity-60 hover:text-destructive sm:opacity-0 sm:group-hover/message:opacity-100" aria-label="حذف الرسالة" onClick={() => setDeleteTarget({ kind: "message", id: message.id })}><Trash2 className="size-4" /></Button>
                        <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-6 ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                          {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                          {message.image_url && images[message.image_url] && (
                            <a href={images[message.image_url]} target="_blank" rel="noreferrer">
                              <img src={images[message.image_url]} alt="صورة مرفقة" loading="lazy" className="mt-1 max-h-72 rounded-lg object-cover" />
                            </a>
                          )}
                          <span className={`mt-1 block text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(message.created_at).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div></div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <form onSubmit={submitReply} className="flex items-center gap-2 border-t border-border p-3">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={attachImage} />
                  <Button type="button" variant="ghost" size="icon" aria-label="إرفاق صورة" disabled={busy} onClick={() => fileRef.current?.click()}>
                    <ImagePlus />
                  </Button>
                  <Input
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="اكتب ردك للمستخدم..."
                    maxLength={2000}
                    aria-label="نص الرد"
                  />
                  <Button type="submit" variant="hero" size="icon" aria-label="إرسال" disabled={busy}><Send /></Button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent dir="rtl" className="max-w-md rounded-lg">
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === "thread" && "سيتم حذف المحادثة وكل رسائلها وصورها نهائياً."}
              {deleteTarget?.kind === "message" && "سيتم حذف هذه الرسالة ومرفقها نهائياً."}
              {deleteTarget?.kind === "apk" && "سيتم حذف ملف التطبيق الحالي وإيقاف زر التحميل حتى ترفع ملفاً جديداً."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start sm:space-x-0">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
