"use server";

import { ActionResult, TasksResult } from "@/types";
import { ServerClient } from '@/database';
import { VerifyToken } from '@/utilities';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


export async function FetchTasks(
	board: number
): Promise<ActionResult<TasksResult>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}
	const supabase = ServerClient();

	// Verify the board belongs to the authenticated user
	const { data: boardRow, error: boardError } = await supabase
		.from('boards')
		.select('*')
		.eq('id', board)
		.eq('userId', user.userId)
		.single();

	if (boardError || !boardRow) {
		return {
			success: false,
			result: null,
			error: boardError?.message || 'Board not found or access denied'
		};
	}

	// Fetch all tasks for this board
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.eq('boardId', board)
		.order('createdAt', { ascending: false });

	if (error) {
		return {
			success: false,
			result: null,
			error: error.message
		};
	}

	let todo = data?.filter(t => t.status === 'todo') || [];
	let inprogress = data?.filter(t => t.status === 'in-progress') || [];
	let done = data?.filter(t => t.status === 'done') || [];

	let columns = [
		{
			id: "todo",
			title: "To do",
			dotColor: "bg-amber-400",
			tasks: todo
		},
		{
			id: "in-progress",
			title: "In Progress",
			dotColor: "bg-sky-500",
			tasks: inprogress
		},
		{
			id: "done",
			title: "Done",
			dotColor: "bg-emerald-500",
			tasks: done
		},
	];

	return {
		success: true,
		result: {
			board: boardRow,
			columns: columns,
			success: true
		}
	};
}

export async function AddTask(
	boardId: number,
	title: string,
	description: string,
	status: 'todo' | 'in-progress' | 'done' = 'todo',
	priority: 'low' | 'medium' | 'high' = 'low'
): Promise<ActionResult<any>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	// Verify the board belongs to the authenticated user
	const { data: boardRow, error: boardError } = await supabase
		.from('boards')
		.select('*')
		.eq('id', boardId)
		.eq('userId', user.userId)
		.single();

	if (boardError || !boardRow) {
		return {
			success: false,
			result: null,
			error: boardError?.message || 'Board not found or access denied'
		};
	}

	// Insert the new task
	const { data, error } = await supabase
		.from('tasks')
		.insert({
			boardId,
			title,
			description,
			priority,
			status,
			userId: user.userId,
			createdAt: new Date().toISOString()
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
		result: data
	};
}

export async function UpdateTask(
	taskId: number,
	updates: {
		title?: string;
		description?: string;
		status?: 'todo' | 'in-progress' | 'done';
		priority?: 'low' | 'medium' | 'high';
	}
): Promise<ActionResult<any>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	// Update the task
	const { data, error } = await supabase
		.from('tasks')
		.update(updates)
		.eq('id', taskId)
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
		result: data
	};
}

export async function DeleteTask(
	taskId: number
): Promise<ActionResult<any>> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value || '';

	const user = await VerifyToken(token);
	if (!user) {
		cookieStore.delete('token');
		return redirect('/login');
	}

	const supabase = ServerClient();

	// Delete the task
	const { error } = await supabase
		.from('tasks')
		.delete()
		.eq('userId', user.userId)
		.eq('id', taskId);

	if (error) {
		return {
			success: false,
			result: null,
			error: error.message
		};
	}

	return {
		success: true,
		result: { id: taskId }
	};
}