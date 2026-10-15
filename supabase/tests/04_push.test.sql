-- Reminders: only for subscribed users who saved a pop-up ending soon, only once.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000b1', 'fan@test');
insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
values ('00000000-0000-0000-0000-0000000000b1', 'https://push.example/1', 'k', 'a');
insert into public.favorites (user_id, popup_id)
select '00000000-0000-0000-0000-0000000000b1', id from public.popups where slug in ('port-designers-fair', 'eilat-beach-cinema');

do $$
declare n int;
begin
  select count(*) into n from public.due_saved_reminders();
  assert n = 1, 'only the pop-up ending within 36h is due, got ' || n;
  perform public.mark_reminders_sent(array['00000000-0000-0000-0000-0000000000b1'::uuid],
                                     array[(select id from public.popups where slug = 'port-designers-fair')]);
  select count(*) into n from public.due_saved_reminders();
  assert n = 0, 'a reminder is sent only once';
end $$;

-- Other users can't see this subscription; anon can't call the job functions.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', false);
set role authenticated;
do $$ begin
  assert (select count(*) from public.push_subscriptions) = 0, 'subscriptions are private';
  begin
    perform public.due_saved_reminders();
    raise exception 'users must not call the reminder job';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claims', '', false);
