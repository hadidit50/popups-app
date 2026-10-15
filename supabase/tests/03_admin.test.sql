-- Admin stats: admins get numbers, everyone else gets nothing.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a1', 'admin2@test');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000a1';

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', false);
set role authenticated;
do $$
declare v jsonb := public.admin_stats();
begin
  assert v is not null, 'admin gets stats';
  assert (v ->> 'live')::int >= 20, 'live count';
  assert (v ->> 'views_7d')::int > 0, 'views counted';
  assert jsonb_array_length(v -> 'top') > 0, 'top list';
end $$;
reset role;

select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
do $$ begin
  begin
    assert public.admin_stats() is null, 'anon gets nothing';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claims', '', false);
