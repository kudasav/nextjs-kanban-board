"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/FormElements";
import { FetchBoards, DeleteBoard } from "@/actions/boards";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import BoardModal from "@/components/BoardModal";
import { BoardType } from "@/types";
import { useConfirmation } from "@/components/ConfimationModal";


export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);
    const { showConfirmation } = useConfirmation()

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['boards'],
        queryFn: async ({ pageParam }) => {
            const result = await FetchBoards(pageParam, query);

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch boards');
            }

            return result.result;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1
    });

    const allBoards = useMemo(() => {
        return data?.pages.flatMap(page => page.result) ?? [];
    }, [data])

    const handleDelete = async (boardId: number) => {
        let confirmed

        confirmed = await showConfirmation({
            title: "Delete Board?",
            description: "Are you sure you want to delete this board?",
            action: "Delete"
        })


        if (confirmed) {
            const result = await DeleteBoard(boardId);
            if (!result.success) {
                alert("Error deleting board: " + result.error);
                return;
            }

            queryClient.setQueryData(['boards'], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        result: page.result.filter((board: BoardType) => board.id !== boardId)
                    }))
                };
            });
        }
    };


    return (
        <main className="mx-auto w-full p-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Boards</h2>
                    <p className="text-sm text-slate-600">Manage your project boards</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        text="Add Board"
                        type="button"
                        variant="primary"
                        style="w-full"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-700">Showing {allBoards.length} Boards</p>

                <div className="relative ">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search boards..."
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full sm:w-72 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none ring-0 focus:border-slate-300 focus:bg-white"
                    />
                </div>
            </div>

            <div >
                {isFetching && !isFetchingNextPage ?
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="rounded-xl border border-gray-200 bg-white p-6">
                                <div className="mb-3">
                                    <Skeleton width="60%" height={20} />
                                </div>
                                <Skeleton count={2} height={14} />

                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                        <Skeleton width={30} height={16} />
                                        <Skeleton width={40} height={12} className="mt-1" />
                                    </div>
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                        <Skeleton width={30} height={16} />
                                        <Skeleton width={40} height={12} className="mt-1" />
                                    </div>
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                        <Skeleton width={30} height={16} />
                                        <Skeleton width={40} height={12} className="mt-1" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Skeleton height={4} />
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    <>
                        {error ?
                            <div className="card p-4 mx-auto max-w-md">
                                <div className="card-body">
                                    <div className="grid justify-center mb-8">
                                        <img alt="" className="max-h-[160px]" src="/illustrations/500.svg" />
                                    </div>
                                    <div className="text-lg font-medium text-gray-900 text-center mb-2">
                                        Unable to fetch your boards
                                    </div>
                                    <div className="text-sm text-gray-700 text-center mb-5">
                                        {error.message}
                                    </div>
                                </div>
                            </div>
                            :
                            <>
                                {allBoards.length == 0 &&
                                    <div className="card p-4 mx-auto max-w-md">
                                        <div className="card-body">
                                            {query && query.length > 0 ?
                                                <>
                                                    <div className="grid justify-center mb-8">
                                                        <img alt="" className="max-h-[160px]" src="/illustrations/empty.svg" />
                                                    </div>
                                                    <div className="text-lg font-medium text-gray-900 text-center mb-2">
                                                        Not Found
                                                    </div>
                                                    <div className="text-sm text-gray-700 text-center mb-5">
                                                        There are no boards matching this search criteria
                                                    </div>
                                                </>
                                                :
                                                <>
                                                    <div className="flex justify-center mb-8">
                                                        <img alt="" className="max-h-[160px]" src="/illustrations/empty.svg" />
                                                    </div>
                                                    <div className="text-lg font-medium text-gray-900 text-center mb-4">
                                                        You have not created any boards yet
                                                    </div>
                                                    <div className="text-sm text-gray-700 text-center mb-5">
                                                        Get started by adding a new board
                                                    </div>
                                                    <div className="text-sm text-gray-700 text-center">
                                                        <Button
                                                            text="Add Board"
                                                            type="button"
                                                            variant="primary"
                                                            style=""
                                                            onClick={() => setIsModalOpen(true)}
                                                        />
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    </div>
                                }
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {allBoards.map((item, index: number) => (
                                        <div
                                            key={index}
                                            className="group relative rounded-xl border border-gray-200 bg-white p-6"
                                        >
                                            <Menu as="div" className="inline-block absolute right-4 top-5">
                                                <MenuButton className="cursor-pointer flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:outline-none focus-visible:outline-none">
                                                    <span className="sr-only">Open options</span>
                                                    <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                                                </MenuButton>

                                                <MenuItems
                                                    transition
                                                    className="absolute right-0 z-10 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                                >
                                                    <div className="py-1">
                                                        <MenuItem>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBoard(item)
                                                                    setIsModalOpen(true)
                                                                }}
                                                                className="cursor-pointer w-full text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                            >
                                                                Update
                                                            </button>
                                                        </MenuItem>
                                                        <MenuItem>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="cursor-pointer w-full text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                            >
                                                                Delete
                                                            </button>
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </Menu>
                                            <Link
                                                className="flex flex-col mr-7"
                                                href={`/dashboard/board/${item.id}`}
                                            >
                                                <h3 className="text-md font-semibold text-gray-700">{item.title}</h3>

                                                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                                            </Link>
                                            <div className="mt-6 grid grid-cols-3 gap-4">
                                                <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                                    <div className="text-sm font-semibold text-gray-700">{item.todo}</div>
                                                    <div className="mt-1 text-xs text-slate-500">Todo</div>
                                                </div>
                                                <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                                    <div className="text-sm font-semibold text-gray-700">{item.inProgress}</div>
                                                    <div className="mt-1 text-xs text-slate-500">In Progress</div>
                                                </div>
                                                <div className="rounded-xl border-2 border-dashed border-slate-200 p-2">
                                                    <div className="text-sm font-semibold text-gray-700">{item.done}</div>
                                                    <div className="mt-1 text-xs text-slate-500">Completed</div>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <div className="h-1 w-full rounded bg-slate-100">
                                                    <div
                                                        className={`h-1 rounded bg-cyan-500`}
                                                        style={{ width: `${(item.todo + item.inProgress + item.done) > 0 ? ((item.done / (item.todo + item.inProgress + item.done)) * 100) : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        }
                    </>
                }

            </div>

            {hasNextPage &&
                <div className="flex items-center justify-center mt-8">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="border-b border-dashed border-cyan-400 pb-1 px-3 text-sm text-cyan-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Show more boards'}
                    </button>
                </div>
            }

            <BoardModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedBoard(null); }}
                board={selectedBoard}
            />
        </main>
    );
}

