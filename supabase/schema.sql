create extension if not exists pgcrypto;

create table if not exists public.students (
  student_id text primary key,
  nama text not null,
  kelas text not null,
  status_voted boolean not null default false,
  voted_at timestamptz,
  device_id text
);

create table if not exists public.candidates (
  id text primary key,
  nomor_urut text not null,
  nama text not null,
  kelas text not null,
  foto text not null,
  visi text not null,
  misi jsonb not null default '[]'::jsonb,
  motto text,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table if not exists public.election_settings (
  id boolean primary key default true check (id),
  title text not null,
  subtitle text not null,
  school_name text not null,
  status text not null check (status in ('NOT_STARTED', 'ACTIVE', 'CLOSED')),
  stage text not null check (stage in ('PUTARAN_1', 'PUTARAN_2_OPSIONAL')),
  academic_year text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  network_simulation_error boolean not null default false,
  spreadsheet_webhook_url text,
  spreadsheet_last_synced timestamptz
);

create table if not exists public.voting_devices (
  id text primary key,
  name text not null,
  code text not null,
  location text not null,
  status text not null check (status in ('online', 'idle', 'offline')),
  last_heartbeat timestamptz not null,
  votes_processed integer not null default 0,
  is_admin_device boolean not null default false
);

create table if not exists public.votes (
  id text primary key,
  candidate_id text not null references public.candidates(id),
  created_at timestamptz not null,
  device_id text not null,
  request_id text not null unique,
  ballot_hash text not null unique,
  stage text not null
);

create table if not exists public.vote_requests (
  request_id text primary key,
  student_id text not null references public.students(student_id),
  candidate_id text not null references public.candidates(id),
  device_id text not null,
  created_at timestamptz not null,
  status text not null check (status in ('PENDING', 'SUCCESS', 'FAILED')),
  result_message text
);

create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamptz not null,
  action text not null,
  actor text not null,
  details text not null,
  severity text not null check (severity in ('info', 'warning', 'critical'))
);

alter table public.students enable row level security;
alter table public.candidates enable row level security;
alter table public.election_settings enable row level security;
alter table public.voting_devices enable row level security;
alter table public.votes enable row level security;
alter table public.vote_requests enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can search students"
  on public.students for select to anon, authenticated using (true);
create policy "authenticated admins manage students"
  on public.students for all to authenticated using (true) with check (true);
create policy "public can read active candidates"
  on public.candidates for select to anon, authenticated using (status = 'active' or auth.role() = 'authenticated');
create policy "authenticated admins manage candidates"
  on public.candidates for all to authenticated using (true) with check (true);
create policy "public can read settings"
  on public.election_settings for select to anon, authenticated using (true);
create policy "authenticated admins manage settings"
  on public.election_settings for all to authenticated using (true) with check (true);
create policy "authenticated admins manage devices"
  on public.voting_devices for all to authenticated using (true) with check (true);
create policy "authenticated admins read votes"
  on public.votes for select to authenticated using (true);
create policy "authenticated admins manage vote requests"
  on public.vote_requests for all to authenticated using (true) with check (true);
create policy "authenticated admins manage audit logs"
  on public.audit_logs for all to authenticated using (true) with check (true);

create or replace function public.submit_vote(
  p_student_id text,
  p_candidate_id text,
  p_device_id text,
  p_request_id text,
  p_ballot_hash text,
  p_stage text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.students;
  v_settings public.election_settings;
  v_now timestamptz := now();
begin
  select * into v_settings from public.election_settings where id = true for share;
  if v_settings.status <> 'ACTIVE' then
    raise exception 'ELECTION_NOT_ACTIVE';
  end if;

  select * into v_student from public.students where student_id = p_student_id for update;
  if not found then raise exception 'STUDENT_NOT_FOUND'; end if;
  if v_student.status_voted then raise exception 'ALREADY_VOTED'; end if;
  if not exists (
    select 1 from public.candidates
    where id = p_candidate_id and status = 'active'
  ) then raise exception 'CANDIDATE_NOT_FOUND'; end if;

  if exists (select 1 from public.vote_requests where request_id = p_request_id and status = 'SUCCESS') then
    return jsonb_build_object('success', true, 'already_voted', true);
  end if;

  insert into public.votes (id, candidate_id, created_at, device_id, request_id, ballot_hash, stage)
  values ('v-' || gen_random_uuid()::text, p_candidate_id, v_now, p_device_id, p_request_id, p_ballot_hash, p_stage);

  update public.students
  set status_voted = true, voted_at = v_now, device_id = p_device_id
  where student_id = p_student_id;

  insert into public.vote_requests (request_id, student_id, candidate_id, device_id, created_at, status, result_message)
  values (p_request_id, p_student_id, p_candidate_id, p_device_id, v_now, 'SUCCESS', p_ballot_hash)
  on conflict (request_id) do update set status = 'SUCCESS', result_message = excluded.result_message;

  return jsonb_build_object('success', true, 'receipt_id', p_ballot_hash, 'timestamp', v_now);
end;
$$;

revoke all on function public.submit_vote(text, text, text, text, text, text) from public;
grant execute on function public.submit_vote(text, text, text, text, text, text) to anon, authenticated;
