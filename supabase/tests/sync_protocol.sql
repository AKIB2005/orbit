-- Disposable Supabase-compatible database only. Run after schema.sql and the migration.
-- The entire fixture is rolled back. Never run against a shared database.
begin;
insert into auth.users(id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);

do $$
declare a jsonb; b jsonb;
begin
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','project','test-project','create',null,
    '{"name":"original","description":"","color_theme":"violet","status":"active","position":[0,0,0],"notes":"","target_date":null,"github":null}');
  if a->>'status' <> 'applied' then raise exception 'create failed: %',a; end if;
  b := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','project','test-project','create',null,
    '{"name":"original","description":"","color_theme":"violet","status":"active","position":[0,0,0],"notes":"","target_date":null,"github":null}');
  if a <> b then raise exception 'replay differs'; end if;
  begin
    perform public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','project','test-project','create',null,'{"name":"different"}');
    raise exception 'changed replay accepted';
  exception when invalid_parameter_value then null; end;
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','project','test-project','update',1,'{"name":"device A"}');
  if (a->'server'->>'sync_revision')::int <> 2 then raise exception 'revision not incremented'; end if;
  b := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','project','test-project','update',1,'{"name":"device B"}');
  if b->>'status' <> 'conflict' or b->'server'->>'name' <> 'device A' then raise exception 'stale edit accepted'; end if;
  b := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','project','test-project','delete',1,'{}');
  if b->>'status' <> 'conflict' then raise exception 'stale delete accepted'; end if;
  begin
    update public.projects set name='bypass' where id='test-project';
    raise exception 'direct write accepted';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$
declare a jsonb;
begin
  if jsonb_array_length(public.read_workspace()->'projects') <> 0 then raise exception 'cross-user read'; end if;
  begin
    perform public.apply_workspace_mutation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','task','other-task','create',null,
      '{"project_id":"test-project","title":"bad"}');
    raise exception 'cross-user parent accepted';
  exception when check_violation then null; end;
  a := public.apply_workspace_mutation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','project','test-project','create',null,
    '{"name":"collision","description":"","color_theme":"violet","status":"active","position":[0,0,0],"notes":"","target_date":null,"github":null}');
  if a->>'status' <> 'conflict' or a->'server' <> 'null'::jsonb then raise exception 'collision disclosed data'; end if;
end $$;

select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$
declare a jsonb;
begin
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5','milestone','test-child','create',null,
    '{"project_id":"test-project","title":"child","due_date":null,"completed":false}');
  if a->>'status' <> 'applied' then raise exception 'child create failed'; end if;
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6','project','test-project','delete',2,'{}');
  if a->>'status' <> 'blocked' then raise exception 'parent delete bypassed child'; end if;
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7','milestone','test-child','delete',1,'{}');
  if a->'server'->>'sync_deleted' <> 'true' then raise exception 'child tombstone missing'; end if;
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8','project','test-project','delete',2,'{}');
  if a->'server'->>'sync_deleted' <> 'true' then raise exception 'project tombstone missing'; end if;
  a := public.apply_workspace_mutation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9','project','test-project','update',2,'{"name":"resurrect"}');
  if a->>'status' <> 'conflict' then raise exception 'resurrection accepted'; end if;
  if jsonb_array_length(public.read_workspace()->'projects') <> 1 then raise exception 'snapshot omitted tombstone'; end if;
end $$;
rollback;
