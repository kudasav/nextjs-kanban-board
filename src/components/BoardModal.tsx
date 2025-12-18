import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { Button } from "./FormElements";
import { AddBoard, UpdateBoard } from "@/actions/boards";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BoardType } from "@/types";


interface Props {
    isOpen: boolean;
    onClose: () => void;
    board?: BoardType | null;
    filter?: string;
}

export default function BoardModal({ isOpen, onClose, board, filter }: Props) {
    const [boardName, setBoardName] = useState("");
    const [boardDescription, setBoardDescription] = useState("");
    const queryClient = useQueryClient();
    const isEditMode = !!board;
    const [loading, setLoading] = useState(false);

    // Update form fields when board prop changes
    useEffect(() => {
        if (board) {
            setBoardName(board.title);
            setBoardDescription(board.description || "");
        } else {
            setBoardName("");
            setBoardDescription("");
        }
    }, [board, isOpen]);

    const handleSubmit = async () => {
        let result;
        setLoading(true);

        if (isEditMode && board) {
            // Update existing board
            result = await UpdateBoard(board.id, boardName, boardDescription);

            if (!result.success) {
                alert("Error updating board: " + result.error);
                setLoading(false);
                return;
            }

            // Update the board in the React Query cache
            queryClient.setQueryData(
                ['boards'],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            result: page.result.map((b: BoardType) =>
                                b.id === board.id ? { ...b, ...result.result } : b
                            )
                        }))
                    };
                }
            );

            setLoading(false);
        } else {
            // Create new board
            result = await AddBoard(boardName, boardDescription);

            if (!result.success) {
                alert("Error creating board: " + result.error);
                setLoading(false);
                return;
            }

            result.result.todo = 0;
            result.result.inProgress = 0;
            result.result.done = 0;

            // Add the new board to the React Query cache
            queryClient.setQueryData(
                ['boards'],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            // Add to first page
                            if (index === 0) {
                                return {
                                    ...page,
                                    result: [result.result, ...page.result],
                                    total: page.total + 1
                                };
                            }
                            return page;
                        })
                    };
                }
            );
            setLoading(false);
        }

        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto sm:min-w-lg rounded-lg bg-white  shadow-xl">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-200 p-6">
                        <DialogTitle className="text-md font-semibold text-gray-700">
                            {isEditMode ? "Update Board" : "Create New Board"}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4 px-6 py-4">
                        <div>
                            <label htmlFor="board-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Board Name
                            </label>
                            <input
                                id="board-name"
                                type="text"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                                placeholder="Enter board name..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="board-description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="board-description"
                                value={boardDescription}
                                onChange={(e) => setBoardDescription(e.target.value)}
                                placeholder="Enter a short description..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                text="Cancel"
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            />
                            <Button
                                text={isEditMode ? "Update Board" : "Create Board"}
                                type="button"
                                variant="primary"
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={!boardName.trim() || !boardDescription.trim() || loading}
                            />
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
};