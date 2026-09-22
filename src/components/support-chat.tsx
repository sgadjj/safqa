import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, MessagesSquare, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { createGuestImageUpload, signGuestImages } from "@/lib/storage.functions";

type ChatRow = {
  id: string;
  sender: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

const STORAGE_KEY = "safqa_chat_token";

function readToken() {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "");
    window.localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const requestUpload = useServerFn(createGuestImageUpload);
  const signImages = useServerFn(signGuestImages);

  useEffect(() => {
    if (open) setToken(readToken());
  }, [open]);

  const load = useCallback(
    async (activeToken: string) => {
      if (!activeToken) return;
      const { data, error } = await supabase.rpc("guest_messages", { _token: activeToken });
      if (error) return;
      const rows = (data ?? []) as ChatRow[];
      setMessages(rows);
      const paths = rows.map((row) => row.image_url).filter((p): p is string => Boolean(p));
      if (paths.length > 0) {
        const signed = await signImages({ data: { token: activeToken, paths } });
        setImages(signed as Record<string, string>);
      }
    },
    [signImages],
  );

  useEffect(() => {
    if (!open || !token) return;
    void load(token);
    const timer = window.setInterval(() => void load(token), 5000);
    return () => window.clearInterval(timer);
  }, [open, token, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, open]);

  async function send(body: string | null, imagePath: string | null) {
    const payload = imagePath
      ? { _token: token, _body: body ?? "", _image_url: imagePath }
      : { _token: token, _body: body ?? "" };
    const { error } = await supabase.rpc("guest_send_message", payload);
    if (error) {
      toast.error("تعذر إرسال الرسالة، حاول مرة أخرى");
      return;
    }
    await load(token);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setText("");
    await send(value, null);
    setBusy(false);
  }

  async function attach(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 10 ميغابايت");
      return;
    }
    const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
    setBusy(true);
    try {
      const upload = await requestUpload({ data: { token, ext } });
      const { error } = await supabase.storage
        .from("chat-images")
        .uploadToSignedUrl(upload.path, upload.token, file);
      if (error) throw error;
      await send(null, upload.path);
    } catch {
      toast.error("تعذر رفع الصورة");
    }
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="محادثة الدعم"
        className="fixed bottom-5 left-5 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-mint transition-transform hover:scale-105"
      >
        <MessagesSquare className="size-6" />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-start bg-ink/70 p-0 backdrop-blur-sm sm:p-5">
          <div className="flex h-full w-full flex-col overflow-hidden border border-border bg-card sm:h-[min(640px,88vh)] sm:w-[400px] sm:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-panel/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                  <MessagesSquare className="size-5" />
                </span>
                <div>
                  <p className="font-display text-sm">مستشار صفقة للسيارات</p>
                  <p className="text-xs text-primary">احچي لنا شتحتاج بسيارتك</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="إغلاق" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  هلا بيك، اكتب نوع السيارة والخدمة المطلوبة، أو أرسل صورة للسيارة أو القطعة، وفريق صفقة يتابع وياك هنا.
                </p>
              )}
              {messages.map((message) => {
                const mine = message.sender === "guest";
                return (
                  <div key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
                    >
                      {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                      {message.image_url && images[message.image_url] && (
                        <img
                          src={images[message.image_url]}
                          alt="صورة مرفقة"
                          loading="lazy"
                          className="mt-1 max-h-60 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={attach} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="إرفاق صورة"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus />
              </Button>
              <Input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="مثلاً: أريد قطعة لكورولا 2020"
                maxLength={2000}
                aria-label="نص الرسالة"
              />
              <Button type="submit" variant="hero" size="icon" aria-label="إرسال" disabled={busy}>
                <Send />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
