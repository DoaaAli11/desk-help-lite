create sequence if not exists public.ticket_number_seq as bigint start with 1026;
select setval('public.ticket_number_seq', greatest(1026, (select coalesce(max(nullif(regexp_replace(ticket_number,'\D','','g'),''))::bigint,1025)+1 from public.tickets)), false);
grant usage, select on sequence public.ticket_number_seq to authenticated, service_role;
alter table public.tickets alter column ticket_number set default 'HD-' || nextval('public.ticket_number_seq');
alter table public.tickets alter column id set default 'tkt-' || replace(gen_random_uuid()::text,'-','');
alter table public.ticket_status_history alter column id set default 'hist-' || replace(gen_random_uuid()::text,'-','');