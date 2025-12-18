-- USERS
create table if not exists public.users (
	id bigint primary key generated always as identity,
	email text unique not null,
	"passwordHash" text not null,
	"firstName" text,
	"lastName" text,
	"createdAt" timestamptz default now()
);

-- BOARDS
create table if not exists public.boards (
	id bigint primary key generated always as identity,
	"userId" bigint not null references public.users(id) on delete cascade,
	title text not null,
	"createdAt" timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
	id bigint primary key generated always as identity,
	"boardId" bigint not null references public.boards(id) on delete cascade,
	title text not null,
	description text,
	status text not null,
	"createdAt" timestamptz default now()
);