import { ColumnType } from "@/types";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, ClipboardList } from "lucide-react";
import TaskCard from "@/components/Kanban/Card";
import { useCardModal } from "../CardModal";


export default function ColumnView({ column, index, boardId }: { column: ColumnType; index: number, boardId: number }) {
    const { showCardModal } = useCardModal()

    const handleAddCard = async () => {
        await showCardModal({ mode: 'create', status: column.id, boardId: boardId });
    }

    return (
        <div className="flex h-full min-h-[400px] min-w-[250px] flex-col gap-3 bg-gray-50 px-1 py-4 rounded-2xl">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 pl-2">{column.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {column.tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => handleAddCard()}
                    className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 flex items-center gap-1 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Card
                </button>
            </div>
            <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-3 rounded-xl p-1 min-h-[200px] ${snapshot.isDraggingOver ? "bg-slate-50" : "bg-transparent"}`}
                    >
                        {column.tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <ClipboardList className="h-12 w-12 text-slate-300 mb-3" strokeWidth={1.5} />
                                <p className="text-sm text-slate-400 font-medium">No tasks yet</p>
                                <p className="text-xs text-slate-400 mt-1">Drop tasks here or click "Add Card"</p>
                            </div>
                        ) : (
                            column.tasks.map((task, idx) => (
                                <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                                    {(dragProvided, dragSnapshot) => (
                                        <div
                                            ref={dragProvided.innerRef}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
                                            className={`${dragSnapshot.isDragging ? "rotate-[0.25deg] shadow-lg" : ""} select-none`}
                                        >
                                            <TaskCard task={task} />
                                        </div>
                                    )}
                                </Draggable>
                            ))
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}