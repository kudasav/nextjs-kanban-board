-- USERS
create table if not exists public.users (
	"id" bigint primary key generated always as identity,
	"email" text unique not null,
	"passwordHash" text,
	"firstName" text,
	"lastName" text,
	"createdAt" timestamptz default now()
);

-- BOARDS
create table if not exists public.boards (
	"id" bigint primary key generated always as identity,
	"userId" bigint not null references public.users(id) on delete cascade,
	"title" text not null,
	"description" text,
	"createdAt" timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
	"id" bigint primary key generated always as identity,
	"userId" bigint not null references public.users(id) on delete cascade,
	"boardId" bigint not null references public.boards(id) on delete cascade,
	"title" text not null,
	"description" text,
	"priority" text not null,
	"status" text not null,
	"createdAt" timestamptz default now()
);

-- Boards query function
create or replace function public.fetch_boards(
	p_user_id bigint,
	p_limit int,
	p_offset int,
	p_title text default null
) returns table (
	id bigint,
	"userId" bigint,
	title text,
	description text,
	"createdAt" timestamptz,
	todo bigint,
	"inProgress" bigint,
	done bigint,
	total_count bigint
) language sql security invoker as $$
select
	b.id,
	b."userId",
	b.title,
	b.description,
	b."createdAt",
	count(t.id) filter (
		where
			t.status = 'todo'
	) as todo,
	count(t.id) filter (
		where
			t.status = 'in-progress'
	) as "inProgress",
	count(t.id) filter (
		where
			t.status = 'done'
	) as done,
	count(*) over() as total_count
from
	public.boards b
	left join public.tasks t on t."boardId" = b.id
where
	b."userId" = p_user_id
	and (
		p_title is null
		or b.title ilike '%' || p_title || '%'
	)
group by
	b.id
order by
	b."createdAt" desc
limit
	p_limit offset p_offset;

$$;