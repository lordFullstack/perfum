-- =========================================================
-- MIGRACIÓN 0006 — IMÁGENES DE PERFUMES (Storage)
-- Bucket público: las imágenes de perfumes se muestran en el
-- futuro Catálogo Online (Fase 10), que es de acceso público
-- sin login. Por eso el bucket es público de lectura, pero
-- escribir requiere permiso de perfumes.create/update.
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('perfume-images', 'perfume-images', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "perfume_images_public_read" on storage.objects
  for select
  using (bucket_id = 'perfume-images');

create policy "perfume_images_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'perfume-images'
    and (current_user_has_permission('perfumes.create') or current_user_has_permission('perfumes.update'))
  );

create policy "perfume_images_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'perfume-images'
    and (current_user_has_permission('perfumes.create') or current_user_has_permission('perfumes.update'))
  );

create policy "perfume_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'perfume-images'
    and (current_user_has_permission('perfumes.create') or current_user_has_permission('perfumes.update'))
  );
