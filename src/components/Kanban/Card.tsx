import { TaskType } from "@/types";
import { Calendar } from "lucide-react";
import moment from "moment";
import { useCardModal } from "@/components/CardModal";

type Priority = "low" | "medium" | "high";

function PriorityPill({ value }: { value: Priority }) {
	const map: Record<Priority, string> = {
		low: "bg-violet-100 text-violet-700",
		medium: "bg-amber-100 text-amber-700",
		high: "bg-rose-100 text-rose-700",
	};
	return (
		<span className={`px-2 py-0.5 text-xs rounded-md ${map[value]}`}>
			{value}
		</span>
	);
}

export default function TaskCard({ task }: { task: TaskType }) {
	const { showCardModal } = useCardModal()

	const handleClick = () => {
		showCardModal({ mode: 'update', cardData: task });
	}

	return (
		<div 
			className="w-full cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
			onClick={handleClick}
		>
			<h4 className="mb-3 w-full text-left text-sm font-semibold text-slate-900">{task.title}</h4>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-xs text-slate-600">
					<Calendar className="h-4 w-4 text-slate-400" /> {moment(task.createdAt).format('MMM D, YYYY')}
				</div>
				<PriorityPill value={task.priority} />
			</div>
		</div>

	);
}