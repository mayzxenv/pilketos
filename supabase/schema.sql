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
  banner_image_url text,
  spreadsheet_webhook_url text,
  spreadsheet_last_synced timestamptz
);

alter table public.election_settings
  add column if not exists banner_image_url text;

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

insert into public.election_settings (
  id, title, subtitle, school_name, status, stage, academic_year,
  start_time, end_time, network_simulation_error
)
values (
  true,
  'Pemilihan Ketua OSIS DIGIVOS7',
  'Digital Voting OSIS',
  'SMPN 7 Bangkalan',
  'NOT_STARTED',
  'PUTARAN_1',
  '2026/2027',
  now(),
  now() + interval '8 hours',
  false
)
on conflict (id) do nothing;

alter table public.students enable row level security;
alter table public.candidates enable row level security;
alter table public.election_settings enable row level security;
alter table public.voting_devices enable row level security;
alter table public.votes enable row level security;
alter table public.vote_requests enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "public can search students" on public.students;
drop policy if exists "authenticated admins read students" on public.students;
drop policy if exists "authenticated admins manage students" on public.students;
drop policy if exists "public can read active candidates" on public.candidates;
drop policy if exists "authenticated admins manage candidates" on public.candidates;
drop policy if exists "public can read settings" on public.election_settings;
drop policy if exists "authenticated admins manage settings" on public.election_settings;
drop policy if exists "authenticated admins manage devices" on public.voting_devices;
drop policy if exists "authenticated admins read votes" on public.votes;
drop policy if exists "authenticated admins manage vote requests" on public.vote_requests;
drop policy if exists "authenticated admins manage audit logs" on public.audit_logs;
create policy "authenticated admins read students"
  on public.students for select to authenticated using (true);
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

create or replace function public.search_students_by_name(p_query text)
returns table (
  student_id text,
  nama text,
  kelas text,
  status_voted boolean,
  voted_at timestamptz,
  device_id text
)
language sql
security definer
set search_path = public
as $$
  select s.student_id, s.nama, s.kelas, s.status_voted, s.voted_at, s.device_id
  from public.students s
  where s.nama ilike '%' || trim(p_query) || '%'
  order by s.nama;
$$;

revoke all on function public.search_students_by_name(text) from public;
grant execute on function public.search_students_by_name(text) to anon, authenticated;

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
  v_existing_request public.vote_requests;
  v_now timestamptz := now();
begin
  select * into v_settings from public.election_settings where id = true for share;
  if not found then
    raise exception 'ELECTION_SETTINGS_NOT_FOUND';
  end if;
  if v_settings.status <> 'ACTIVE' then
    raise exception 'ELECTION_NOT_ACTIVE';
  end if;

  select * into v_existing_request
  from public.vote_requests
  where request_id = p_request_id
  for share;
  if found and v_existing_request.status = 'SUCCESS' then
    return jsonb_build_object(
      'success', true,
      'already_voted', true,
      'receipt_id', v_existing_request.result_message,
      'timestamp', v_existing_request.created_at
    );
  end if;

  select * into v_student from public.students where student_id = p_student_id for update;
  if not found then raise exception 'STUDENT_NOT_FOUND'; end if;
  if v_student.status_voted then raise exception 'ALREADY_VOTED'; end if;
  if not exists (
    select 1 from public.candidates
    where id = p_candidate_id and lower(status) = 'active'
  ) then raise exception 'CANDIDATE_NOT_FOUND'; end if;

  insert into public.votes (id, candidate_id, created_at, device_id, request_id, ballot_hash, stage)
  values ('v-' || gen_random_uuid()::text, p_candidate_id, v_now, p_device_id, p_request_id, p_ballot_hash, v_settings.stage);

  update public.students
  set status_voted = true, voted_at = v_now, device_id = p_device_id
  where student_id = p_student_id;

  update public.voting_devices
  set status = 'online',
      last_heartbeat = v_now,
      votes_processed = votes_processed + 1
  where id = p_device_id;

  insert into public.vote_requests (request_id, student_id, candidate_id, device_id, created_at, status, result_message)
  values (p_request_id, p_student_id, p_candidate_id, p_device_id, v_now, 'SUCCESS', p_ballot_hash)
  on conflict (request_id) do update set status = 'SUCCESS', result_message = excluded.result_message;

  return jsonb_build_object('success', true, 'receipt_id', p_ballot_hash, 'timestamp', v_now);
end;
$$;

revoke all on function public.submit_vote(text, text, text, text, text, text) from public;
grant execute on function public.submit_vote(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.reset_election_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'authenticated' then
    raise exception 'ADMIN_AUTH_REQUIRED';
  end if;

  delete from public.votes where true;
  delete from public.vote_requests where true;
  delete from public.candidates where true;
  delete from public.students where true;
  delete from public.voting_devices where true;
  delete from public.audit_logs where true;
  update public.election_settings
  set status = 'NOT_STARTED';
end;
$$;

revoke all on function public.reset_election_data() from public;
grant execute on function public.reset_election_data() to authenticated;
