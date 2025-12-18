export interface PaginatedList <T> {
	result: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

export interface ActionResult<T> {
	success: boolean;
	result: T;
	error?: string;
}

export interface BoardType {
	id: number;
	userId: string;
	title: string;
	description?: string;
	createdAt: string;
	todo?: number;
	inProgress?: number;
	done?: number;
}

export interface TaskType {
	id?: string;
	boardId?: string;
	title: string;
	description: string;
	status: 'todo' | 'in-progress' | 'done';
	priority: 'low' | 'medium' | 'high';
	createdAt?: string;
}

export interface UserType {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	createdAt: string;
}

export interface ColumnType {
	id: string;
	title: string;
	dotColor: string;
	tasks: TaskType[];
};

export interface TasksResult {
	board: BoardType;
	columns: ColumnType[];
	success: boolean;
	error?: string;
}