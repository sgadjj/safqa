-- Live guest chat threads
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_token text NOT NULL UNIQUE,
  guest_label text NOT NULL DEFAULT 'زائر',
  status public.support_status NOT NULL DEFAULT 'new',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('guest','admin')),
  body text CHECK (body IS NULL OR char_length(body) <= 2000),
  image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (body IS NOT NULL OR image_url IS NOT NULL)
);

CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);

CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  apk_url text,
  apk_version text,
  apk_size bigint,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.app_settings (id) VALUES (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read threads" ON public.chat_threads FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update threads" ON public.chat_threads FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins read messages" ON public.chat_messages FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin') AND sender = 'admin');
CREATE POLICY "anyone reads app settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins update app settings" ON public.app_settings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Guest access happens only through these definer functions, keyed by a secret token
CREATE OR REPLACE FUNCTION public.guest_send_message(_token text, _body text, _image_url text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _thread uuid;
  _id uuid;
BEGIN
  IF _token IS NULL OR char_length(_token) < 16 OR char_length(_token) > 100 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;
  IF (_body IS NULL OR btrim(_body) = '') AND _image_url IS NULL THEN
    RAISE EXCEPTION 'empty message';
  END IF;

  INSERT INTO public.chat_threads (guest_token)
  VALUES (_token)
  ON CONFLICT (guest_token) DO UPDATE SET last_message_at = now()
  RETURNING id INTO _thread;

  INSERT INTO public.chat_messages (thread_id, sender, body, image_url)
  VALUES (_thread, 'guest', NULLIF(btrim(coalesce(_body,'')), ''), _image_url)
  RETURNING id INTO _id;

  UPDATE public.chat_threads SET last_message_at = now(), status = CASE WHEN status = 'resolved' THEN 'new'::public.support_status ELSE status END WHERE id = _thread;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_messages(_token text)
RETURNS TABLE (id uuid, sender text, body text, image_url text, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, m.sender, m.body, m.image_url, m.created_at
  FROM public.chat_messages m
  JOIN public.chat_threads t ON t.id = m.thread_id
  WHERE t.guest_token = _token
  ORDER BY m.created_at;
$$;

REVOKE ALL ON FUNCTION public.guest_send_message(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guest_messages(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guest_send_message(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_messages(text) TO anon, authenticated;