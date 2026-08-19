drop policy "tickets visible to owner or staff" on public.tickets;
drop policy "tickets created by self" on public.tickets;
drop policy "tickets updated by staff" on public.tickets;
drop policy "history visible with ticket" on public.ticket_status_history;
drop policy "history insert" on public.ticket_status_history;

create policy "tickets visible to owner or staff" on public.tickets for select to authenticated
using (
  created_by = (select p.app_user_id from public.profiles p where p.id = auth.uid())
  or exists (select 1 from public.user_roles r where r.user_id = auth.uid()
             and r.role in ('support','manager','operations','engineer'))
);

create policy "tickets created by self" on public.tickets for insert to authenticated
with check (created_by = (select p.app_user_id from public.profiles p where p.id = auth.uid()));

create policy "tickets updated by staff" on public.tickets for update to authenticated
using (exists (select 1 from public.user_roles r where r.user_id = auth.uid()
               and r.role in ('support','manager','operations','engineer')))
with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid()
               and r.role in ('support','manager','operations','engineer')));

create policy "history visible with ticket" on public.ticket_status_history for select to authenticated
using (exists (select 1 from public.tickets t where t.id = ticket_id));

create policy "history insert" on public.ticket_status_history for insert to authenticated
with check (changed_by = (select p.app_user_id from public.profiles p where p.id = auth.uid()));