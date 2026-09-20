CREATE OR REPLACE FUNCTION public.admin_delete_message(_message_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _image_path text;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  DELETE FROM public.chat_messages
  WHERE id = _message_id
  RETURNING image_url INTO _image_path;
  RETURN _image_path;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_message(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_message(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_delete_thread(_thread_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _image_paths text[];
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT COALESCE(array_agg(image_url) FILTER (WHERE image_url IS NOT NULL), ARRAY[]::text[])
  INTO _image_paths
  FROM public.chat_messages
  WHERE thread_id = _thread_id;
  DELETE FROM public.chat_messages WHERE thread_id = _thread_id;
  DELETE FROM public.chat_threads WHERE id = _thread_id;
  RETURN _image_paths;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_thread(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_thread(uuid) TO authenticated, service_role;