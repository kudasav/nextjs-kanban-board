"use client";

import { ReactNode, use } from "react";
import {
	DragDropContext,
	type DropResult,
} from "@hello-pangea/dnd";
import ColumnView from "@/components/Kanban/Column";
import { TasksResult } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchTasks, UpdateTask } from "@/actions/tasks";
import Loader from "@/components/PageLoader";
import { usePopup } from "@/components/PopupWrapper";


interface Props {
	id: string
}

export default function Board({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<Props>
}) {
	const { id } = use(params);
	const queryClient = useQueryClient();
	const { openPopup } = usePopup();

	const { status, data, error, isFetching, refetch } = useQuery({
		queryKey: ['tasks', { board: id }],
		queryFn: async ({ queryKey }): Promise<TasksResult> => {
			const result = await FetchTasks(Number(id));

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch boards');
			}

			return result.result;
		}
	})

	/**
	 * Updates the task status in the database
	 * Reverts the cache using the previous snapshot if the update fails
	 */
	async function updateTaskStatus(
		taskId: string, 
		newStatus: 'todo' | 'in-progress' | 'done',
		previousData: TasksResult
	) {
		const queryKey = ['tasks', { board: id }];
		
		try {
			const updateResult = await UpdateTask(
				parseInt(taskId),
				{ status: newStatus }
			);

			// If the database update fails, revert the cache to the previous state
			if (!updateResult.success) {
				openPopup("error", "Failed to update task status, please check your internet connection");
				queryClient.setQueryData<TasksResult>(queryKey, previousData);
			}
		} catch (error) {
			openPopup("error", "Failed to update task status, please check your internet connection");

			// Revert the optimistic update to the previous state
			queryClient.setQueryData<TasksResult>(queryKey, previousData);
		}
	}

	async function onDragEnd(result: DropResult) {
		const { destination, source } = result;
		
		// If dropped outside a droppable area, do nothing
		if (!destination) return;
		
		// If dropped in the same position, do nothing
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		// Store the moved task ID for database update
		let movedTaskId: string | undefined;

		// Store the previous state before optimistic update
		const queryKey = ['tasks', { board: id }];
		const previousData = queryClient.getQueryData<TasksResult>(queryKey);
		
		if (!previousData) return;

		// Update the cache optimistically for instant UI feedback
		queryClient.setQueryData<TasksResult>(queryKey, (oldData) => {
			if (!oldData) return oldData;

			const columns = oldData.columns;
			
			// Find the source and destination column indexes
			const sourceColIndex = columns.findIndex((c) => c.id === source.droppableId);
			const destColIndex = columns.findIndex(
				(c) => c.id === destination.droppableId
			);

			// Create a copy of columns and tasks arrays to maintain immutability
			const next = [...columns];
			const sourceTasks = Array.from(next[sourceColIndex].tasks);
			
			// Remove the task from its original position
			const [moved] = sourceTasks.splice(source.index, 1);
			movedTaskId = moved.id;

			// Handle reordering within the same column
			if (sourceColIndex === destColIndex) {
				// Insert the task at the new position within the same column
				sourceTasks.splice(destination.index, 0, moved);
				next[sourceColIndex] = { ...next[sourceColIndex], tasks: sourceTasks };
			} else {
				// Handle moving between different columns
				const destTasks = Array.from(next[destColIndex].tasks);
				
				// Insert the task at the new position in the destination column
				destTasks.splice(destination.index, 0, moved);
				
				// Update both the source and destination columns
				next[sourceColIndex] = { ...next[sourceColIndex], tasks: sourceTasks };
				next[destColIndex] = { ...next[destColIndex], tasks: destTasks };
			}

			return {
				...oldData,
				columns: next
			};
		});

		// If the task was moved between columns, update the status in the database
		if (source.droppableId !== destination.droppableId && movedTaskId) {
			await updateTaskStatus(
				movedTaskId, 
				destination.droppableId as 'todo' | 'in-progress' | 'done',
				previousData
			);
		}
	}

	if(isFetching) return <Loader/>

	return (
		<main className="mx-auto w-full px-4">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between px-2">
				<div>
					<h2 className="text-lg font-semibold text-gray-700 capitalize">{data.board.title}</h2>
					<p className="text-sm text-slate-600">{data.board.description}</p>
				</div>
				<div className="flex items-center gap-3"></div>
			</div>

			<div className="absolute w-full overflow-x-scroll max-w-[1320px] mx-auto px-2 sm:px-0">
				{/* Board */}
				<DragDropContext
					onDragEnd={onDragEnd}
				>
					<div
						className="flex flex-row gap-x-6 overflow-auto w-full max-w-full"
					>
						{data.columns.map((col, idx) => (
							<div key={col.id} className="w-80 flex-shrink-0 flex-1">
								<ColumnView column={col} index={idx} boardId={data.board.id}/>
							</div>
						))}
					</div>
				</DragDropContext>
			</div>
		</main>
	);
}

