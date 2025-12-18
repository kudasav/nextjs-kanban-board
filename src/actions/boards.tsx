"use server";

import { ActionResult, BoardType, UserType, PaginatedList } from "@/types";
import { ServerClient } from '@/database';
import { VerifyToken } from '@/utilities';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function FetchBoards(
	page: number,
	title?: string
): Promise<ActionResult<PaginatedList<BoardType>>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();
	const limit = 6;
	const offset = (page - 1) * limit;

	const { data, error } = await supabase.rpc(
		'fetch_boards',
		{
			p_user_id: user.userId,
			p_limit: limit,
			p_offset: offset,
			p_title: title && title.trim() !== '' ? title : null
		}
	);

	if (error) {
		return {
			success: false,
			result: null,
			error: error.message
		};
	}

	const totalItems = data?.[0]?.total_count ?? 0;
	const hasMore = offset + limit < totalItems;

	// remove total_count from rows
	const boards = (data || []).map(({ total_count, ...board }) => board);

	return {
		success: true,
		result: {
			result: boards,
			total: totalItems,
			page,
			pageSize: limit,
			hasMore
		}
	};
}


export async function AddBoard(title: string, description: string): Promise<ActionResult<BoardType>> {

	const cookieStore = await cookies()
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	const { data, error } = await supabase
		.from('boards')
		.insert({
			title,
			description,
			userId: user.userId
		})
		.select()
		.single();

	if (error) {
		return {
			success: false,
			result: null,
			error: error.message
		};
	}

	return {
		success: true,
		result: data,
	};
}

export async function UpdateBoard(id: number, title: string, description: string): Promise<ActionResult<BoardType>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	const { data, error } = await supabase
		.from('boards')
		.update({
			title,
			description
		})
		.eq('id', id)
		.eq('userId', user.userId)
		.select()
		.single();

	if (error) {
		return {
			success: false,
			result: null,
			error: error.message
		};
	}

	return {
		success: true,
		result: data,
	};
}

export async function DeleteBoard(id: number): Promise<ActionResult<boolean>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	const { error } = await supabase
		.from('boards')
		.delete()
		.eq('id', id)
		.eq('userId', user.userId);

	if (error) {
		return {
			success: false,
			result: false,
			error: error.message
		};
	}

	return {
		success: true,
		result: true,
	};
}