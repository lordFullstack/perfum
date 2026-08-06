-- =========================================================
-- MIGRACIÓN 0007 — ARREGLOS SOBRE FASE 5
-- Ya incluidos en 0005_recipes.sql para instalaciones nuevas
-- (create_recipe, calculate_recipe_cost, check_recipe_feasibility,
-- duplicate_recipe ya nacen con el revoke a anon correcto, el
-- trigger de perfumes.updated_at y la política recipes_update
-- correcta). Este archivo documenta el parche que se aplicó al
-- proyecto real, generado en una sesión anterior que había dejado
-- estos 3 puntos sin cerrar. Ejecutarlo en una base que ya tenga
-- 0005 aplicado con la versión "vieja" (sin estos arreglos) es
-- seguro y no falla si ya están aplicados a mano.
-- =========================================================

revoke execute on function calculate_recipe_cost(uuid) from anon, public;
revoke execute on function check_recipe_feasibility(uuid, integer) from anon, public;
revoke execute on function create_recipe(uuid, numeric, text, jsonb) from anon, public;
revoke execute on function duplicate_recipe(uuid) from anon, public;

grant execute on function calculate_recipe_cost(uuid) to authenticated;
grant execute on function check_recipe_feasibility(uuid, integer) to authenticated;
grant execute on function create_recipe(uuid, numeric, text, jsonb) to authenticated;
grant execute on function duplicate_recipe(uuid) to authenticated;

drop trigger if exists trg_perfumes_updated_at on perfumes;
create trigger trg_perfumes_updated_at
  before update on perfumes
  for each row execute function set_updated_at();

drop policy if exists "recipes_update" on recipes;
create policy "recipes_update" on recipes
  for update to authenticated
  using (
    branch_id = current_user_branch()
    and (current_user_has_permission('recipes.update') or current_user_has_permission('recipes.delete'))
  )
  with check (branch_id = current_user_branch());
