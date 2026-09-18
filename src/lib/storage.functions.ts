import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tokenSchema = z.string().min(16).max(100).regex(/^[A-Za-z0-9_-]+$/);
const extSchema = z.enum(["png", "jpg", "jpeg", "webp", "gif"]);
const pathsSchema = z.array(z.string().min(3).max(300)).max(60);

async function assertAdmin(supabase: { from: (t: string) => any }, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("forbidden");
}

export const createGuestImageUpload = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; ext: string }) =>
    z.object({ token: tokenSchema, ext: extSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `guest/${data.token}/${crypto.randomUUID()}.${data.ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("chat-images")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error("upload_url_failed");
    return { path, token: signed.token };
  });

export const signGuestImages = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; paths: string[] }) =>
    z.object({ token: tokenSchema, paths: pathsSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowed = data.paths.filter(
      (p) => p.startsWith(`guest/${data.token}/`) || p.startsWith("admin/"),
    );
    if (allowed.length === 0) return {} as Record<string, string>;
    const { data: signed } = await supabaseAdmin.storage
      .from("chat-images")
      .createSignedUrls(allowed, 3600);
    const map: Record<string, string> = {};
    for (const item of signed ?? []) if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
    return map;
  });

export const createAdminImageUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ext: string }) => z.object({ ext: extSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `admin/${crypto.randomUUID()}.${data.ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("chat-images")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error("upload_url_failed");
    return { path, token: signed.token };
  });

export const signAdminImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { paths: string[] }) => z.object({ paths: pathsSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.paths.length === 0) return {} as Record<string, string>;
    const { data: signed } = await supabaseAdmin.storage
      .from("chat-images")
      .createSignedUrls(data.paths, 3600);
    const map: Record<string, string> = {};
    for (const item of signed ?? []) if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
    return map;
  });

export const createApkUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { version: string }) =>
    z.object({ version: z.string().trim().min(1).max(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeVersion = data.version.replace(/[^A-Za-z0-9.]/g, "");
    const path = `safqa/${crypto.randomUUID()}-${safeVersion || "app"}.apk`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("app-downloads")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error("upload_url_failed");
    return { path, token: signed.token };
  });

export const getAppDownload = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("apk_url, apk_version, apk_size")
    .eq("id", true)
    .maybeSingle();
  if (!settings?.apk_url) return { url: null, version: null, size: null };
  const { data: signed } = await supabaseAdmin.storage
    .from("app-downloads")
    .createSignedUrl(settings.apk_url, 3600, { download: `safqa-${settings.apk_version ?? "app"}.apk` });
  return {
    url: signed?.signedUrl ?? null,
    version: settings.apk_version,
    size: settings.apk_size,
  };
});
