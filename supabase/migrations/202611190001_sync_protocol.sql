-- REVIEW ONLY: apply only to a disposable database until cutover is approved.
-- This migration revokes legacy client writes; it is NOT backwards compatible.
begin;

alter table public.projects add column sync_revision bigint not null default 1, add column sync_deleted boolean not null default false;
alter table public.tasks add column sync_revision bigint not null default 1, add column sync_deleted boolean not null default false;
alter table public.milestones add column sync_revision bigint not null default 1, add column sync_deleted boolean not null default false;
alter table public.links add column sync_revision bigint not null default 1, add column sync_deleted boolean not null default false;

create table public.sync_mutation_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  mutation_id uuid not null,
  request jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, mutation_id)
);
alter table public.sync_mutation_receipts enable row level security;
revoke all on public.sync_mutation_receipts from public, anon, authenticated;

-- Existing permissive ALL policies must be removed: permissive policies combine with OR.
drop policy "Users can manage their own projects" on public.projects;
drop policy "Users can manage their own tasks" on public.tasks;
drop policy "Users can manage their own milestones" on public.milestones;
drop policy "Users can manage their own links" on public.links;
create policy sync_read_projects on public.projects for select to authenticated using (user_id = auth.uid());
create policy sync_read_tasks on public.tasks for select to authenticated using (user_id = auth.uid());
create policy sync_read_milestones on public.milestones for select to authenticated using (user_id = auth.uid());
create policy sync_read_links on public.links for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete, truncate, references, trigger on public.projects, public.tasks, public.milestones, public.links from public, anon, authenticated;
grant select on public.projects, public.tasks, public.milestones, public.links to authenticated;

-- A single SQL statement supplies one MVCC snapshot for all four collections.
create function public.read_workspace() returns jsonb
language sql stable security definer set search_path = pg_catalog, public, auth
as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'projects', coalesce((select jsonb_agg(to_jsonb(p)) from public.projects p where p.user_id = auth.uid()), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(to_jsonb(t)) from public.tasks t where t.user_id = auth.uid()), '[]'::jsonb),
    'milestones', coalesce((select jsonb_agg(to_jsonb(m)) from public.milestones m where m.user_id = auth.uid()), '[]'::jsonb),
    'links', coalesce((select jsonb_agg(to_jsonb(l)) from public.links l where l.user_id = auth.uid()), '[]'::jsonb)
  ) end;
$$;

-- Each user is serialized to make parent checks, child creation and deletion atomic.
-- The request is retained verbatim instead of relying on a hash or extension.
create function public.apply_workspace_mutation(
  p_mutation_id uuid, p_entity text, p_id text, p_operation text,
  p_base_revision bigint, p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, auth
as $$
declare
  v_user uuid := auth.uid(); v_table text; v_columns text[]; v_column text;
  v_request jsonb; v_previous public.sync_mutation_receipts%rowtype;
  v_existing jsonb; v_merged jsonb; v_result jsonb; v_fields text; v_values text; v_assign text;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_mutation_id is null or p_id is null or length(p_id) = 0 or length(p_id) > 200
     or p_operation not in ('create', 'update', 'delete') or p_operation is null
     or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid mutation' using errcode = '22023';
  end if;
  case p_entity
    when 'project' then v_table := 'projects'; v_columns := array['name','description','color_theme','status','position','notes','target_date','github'];
    when 'task' then v_table := 'tasks'; v_columns := array['project_id','title','description','status','priority','due_date','orbit_index','depends_on_task_id','milestone_id','github_issue_number'];
    when 'milestone' then v_table := 'milestones'; v_columns := array['project_id','title','due_date','completed'];
    when 'link' then v_table := 'links'; v_columns := array['source_project_id','target_project_id'];
    else raise exception 'invalid entity' using errcode = '22023';
  end case;
  if (p_operation = 'create' and p_base_revision is not null) or
     (p_operation <> 'create' and (p_base_revision is null or p_base_revision < 1)) or
     (p_operation = 'delete' and p_payload <> '{}'::jsonb) or
     exists (select 1 from jsonb_object_keys(p_payload) k where not (k = any(v_columns))) then
    raise exception 'invalid mutation payload' using errcode = '22023';
  end if;
  v_request := jsonb_build_object('entity',p_entity,'id',p_id,'operation',p_operation,'base',p_base_revision,'payload',p_payload);
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  select * into v_previous from public.sync_mutation_receipts where user_id=v_user and mutation_id=p_mutation_id;
  if found then
    if v_previous.request <> v_request then raise exception 'mutation id reused' using errcode = '22023'; end if;
    return v_previous.result;
  end if;
  execute format('select to_jsonb(t) from public.%I t where id=$1 and user_id=$2 for update', v_table)
    into v_existing using p_id, v_user;
  if (p_operation = 'create' and v_existing is not null) or
     (p_operation <> 'create' and (v_existing is null or (v_existing->>'sync_revision')::bigint <> p_base_revision or (v_existing->>'sync_deleted')::boolean)) then
    v_result := jsonb_build_object('status','conflict','server',v_existing);
  else
    v_merged := coalesce(v_existing, '{}'::jsonb) || p_payload || jsonb_build_object('id',p_id,'user_id',v_user);
    if p_operation <> 'delete' then
      if p_entity in ('task','milestone') and not exists (
        select 1 from public.projects where id=v_merged->>'project_id' and user_id=v_user and not sync_deleted
      ) then raise exception 'invalid parent reference' using errcode='23514'; end if;
      if p_entity = 'link' and (v_merged->>'source_project_id' = v_merged->>'target_project_id' or
        not exists (select 1 from public.projects where id=v_merged->>'source_project_id' and user_id=v_user and not sync_deleted) or
        not exists (select 1 from public.projects where id=v_merged->>'target_project_id' and user_id=v_user and not sync_deleted))
      then raise exception 'invalid parent reference' using errcode='23514'; end if;
      if p_entity = 'task' and v_merged->>'depends_on_task_id' is not null and not exists (
        select 1 from public.tasks where id=v_merged->>'depends_on_task_id' and user_id=v_user and project_id=v_merged->>'project_id' and not sync_deleted
      ) then raise exception 'invalid task reference' using errcode='23514'; end if;
      if p_entity = 'task' and v_merged->>'milestone_id' is not null and not exists (
        select 1 from public.milestones where id=v_merged->>'milestone_id' and user_id=v_user and project_id=v_merged->>'project_id' and not sync_deleted
      ) then raise exception 'invalid milestone reference' using errcode='23514'; end if;
    end if;
    if p_operation = 'delete' and p_entity = 'project' and (
      exists(select 1 from public.tasks where user_id=v_user and project_id=p_id and not sync_deleted) or
      exists(select 1 from public.milestones where user_id=v_user and project_id=p_id and not sync_deleted) or
      exists(select 1 from public.links where user_id=v_user and (source_project_id=p_id or target_project_id=p_id) and not sync_deleted)
    ) then
      v_result := jsonb_build_object('status','blocked','reason','live_children','server',v_existing);
    elsif p_operation = 'delete' then
      execute format('update public.%I set sync_deleted=true, sync_revision=sync_revision+1 where id=$1 and user_id=$2 returning to_jsonb(%I)',v_table,v_table)
        into v_existing using p_id,v_user;
      v_result := jsonb_build_object('status','applied','server',v_existing);
    else
      select string_agg(format('%I',c),','), string_agg(format('r.%I',c),','), string_agg(format('%1$I = r.%1$I',c),',')
        into v_fields,v_values,v_assign from unnest(v_columns) c;
      if p_operation = 'create' then
        -- Explicit columns prevent clients supplying ownership, revisions, or timestamps.
        begin
          execute format('insert into public.%1$I (id,user_id,%2$s) select $1,$2,%3$s from jsonb_populate_record(null::public.%1$I,$3) r returning to_jsonb(%1$I)',v_table,v_fields,v_values)
            into v_existing using p_id,v_user,v_merged;
        exception when unique_violation then
          -- Do not reveal whether an id belongs to another account.
          v_result := jsonb_build_object('status','conflict','server',null);
        end;
      else
        execute format('update public.%1$I t set %2$s, sync_revision=t.sync_revision+1 from jsonb_populate_record(null::public.%1$I,$3) r where t.id=$1 and t.user_id=$2 returning to_jsonb(t)',v_table,v_assign)
          into v_existing using p_id,v_user,v_merged;
      end if;
      if v_result is null then v_result := jsonb_build_object('status','applied','server',v_existing); end if;
    end if;
  end if;
  insert into public.sync_mutation_receipts(user_id,mutation_id,request,result) values(v_user,p_mutation_id,v_request,v_result);
  return v_result;
end;
$$;
revoke all on function public.read_workspace() from public, anon;
revoke all on function public.apply_workspace_mutation(uuid,text,text,text,bigint,jsonb) from public, anon;
grant execute on function public.read_workspace() to authenticated;
grant execute on function public.apply_workspace_mutation(uuid,text,text,text,bigint,jsonb) to authenticated;
commit;
