"use client"

import { createContext, useContext, useState, useCallback, ReactNode, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems, TransitionChild } from '@headlessui/react'
import { Button } from './FormElements'
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup'
import TextEditor from './TextEditor';
import { ChevronDownIcon, PencilLineIcon } from 'lucide-react';
import { AddTask, UpdateTask, DeleteTask } from '@/actions/tasks';
import { TaskType, TasksResult } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmation } from './ConfimationModal';
import { usePopup } from './PopupWrapper';


interface CreateCardOptions {
	mode: 'create'
	status: string
	boardId: number
}

interface UpdateCardOptions {
	mode: 'update'
	cardData: TaskType
}

type CardModalOptions = CreateCardOptions | UpdateCardOptions

interface CardModalContextType {
	showCardModal: (opts: CardModalOptions) => Promise<TaskType | null>
}

const CardModalContext = createContext<CardModalContextType | undefined>(undefined)

const ValidationSchema = Yup.object({
	title: Yup.string()
		.required('Title is required')
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must not exceed 100 characters'),
	description: Yup.string()
		.max(500, 'Description must not exceed 500 characters'),
	priority: Yup.string()
		.oneOf(['low', 'medium', 'high'], 'Invalid priority')
		.required('Priority is required')
})

export function CardModalProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient()
	const [isOpen, setIsOpen] = useState(false)
	const [options, setOptions] = useState<CardModalOptions>({
		mode: 'create',
		status: 'todo',
		boardId: 0
	})
	const [formData, setFormData] = useState<TaskType>({
		title: '',
		description: '',
		priority: 'medium',
		status: 'todo'
	})
	const [resolvePromise, setResolvePromise] = useState<((value: TaskType | null) => void) | null>(null)
	const [isTitleEditing, setIsTitleEditing] = useState(false)
	const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
	const { showConfirmation } = useConfirmation()
	const { openPopup } = usePopup();

	const showCardModal = useCallback((opts: CardModalOptions): Promise<TaskType | null> => {
		setOptions(opts)

		if (opts.mode === 'update') {
			setFormData(opts.cardData)
			setIsTitleEditing(false)
			setIsDescriptionEditing(false)
		} else {
			setFormData({
				title: '',
				description: '',
				priority: 'low',
				status: opts.status as 'todo' | 'in-progress' | 'done'
			})
			setIsTitleEditing(true)
			setIsDescriptionEditing(true)
		}

		setIsOpen(true)

		return new Promise<TaskType | null>((resolve) => {
			setResolvePromise(() => resolve)
		})
	}, [])

	const handleClose = useCallback((result: TaskType | null) => {
		setIsOpen(false)
		if (resolvePromise) {
			resolvePromise(result)
			setResolvePromise(null)
		}
	}, [resolvePromise])

	const initialValues: TaskType = formData

	const onSubmit = async (values: TaskType, actions: FormikHelpers<TaskType>) => {
		try {
			if (options.mode === 'create') {
				const result = await AddTask(
					options.boardId,
					values.title,
					values.description,
					(values.status as 'todo' | 'in-progress' | 'done') || 'todo'
				)

				if (!result.success) {
					openPopup("error", result.error || "Failed to create card");
					actions.setSubmitting(false)
					return
				}

				// Update cache with the new task
				const queryKey = ['tasks', { board: options.boardId.toString() }]
				queryClient.setQueryData<TasksResult>(queryKey, (oldData) => {
					if (!oldData) return oldData

					const newTask = result.result
					const updatedColumns = oldData.columns.map(col => {
						if (col.id === newTask.status) {
							return {
								...col,
								tasks: [newTask, ...col.tasks]
							}
						}
						return col
					})

					return {
						...oldData,
						columns: updatedColumns
					}
				})

				handleClose(values)
				openPopup("success", "card created successfully");

			} else if (options.mode === 'update' && values.id) {
				const result = await UpdateTask(
					parseInt(values.id),
					{
						title: values.title,
						description: values.description,
						status: values.status as 'todo' | 'in-progress' | 'done',
						priority: values.priority as 'low' | 'medium' | 'high'
					}
				)

				if (!result.success) {
					openPopup("error", result.error || "Failed to update card");
					actions.setSubmitting(false)
					return
				}

				// Update cache with the updated task
				if (values.boardId) {
					const queryKey = ['tasks', { board: values.boardId.toString() }]
					queryClient.setQueryData<TasksResult>(queryKey, (oldData) => {
						if (!oldData) return oldData
						const updatedTask = result.result

						const updatedColumns = oldData.columns.map(col => {
							// Remove the task from its old column
							const filteredTasks = col.tasks.filter(t => t.id !== values.id)

							// Add it to the new column if this is the target column
							if (col.id === updatedTask.status) {
								return {
									...col,
									tasks: filteredTasks.concat(updatedTask)
								}
							}

							return {
								...col,
								tasks: filteredTasks
							}
						})

						return {
							...oldData,
							columns: updatedColumns
						}
					})
				}

				handleClose(values)
				openPopup("success", "card updated successfully");
			}
		} catch (error) {
			openPopup("error", "An unexpected error occurred");
		} finally {
			actions.setSubmitting(false)
		}
	}

	const handleDelete = async () => {
		let confirmed = await showConfirmation({
			title: "Delete Card?",
			description: "Are you sure you want to delete this card?",
			action: "Delete"
		})

		if (confirmed && options.mode === 'update') {
			let result = await DeleteTask(parseInt(options.cardData.id))

			if (!result.success) {
				openPopup("error", result.error || "Failed to delete card");
				return
			}

			if (result.success) {
				// Update cache to remove the deleted task
				const boardId = parseInt(options.cardData.boardId)
				const queryKey = ['tasks', { board: boardId.toString() }]
				queryClient.setQueryData<TasksResult>(queryKey, (oldData) => {
					if (!oldData) return oldData

					const updatedColumns = oldData.columns.map(col => ({
						...col,
						tasks: col.tasks.filter(t => t.id !== options.cardData.id)
					}))

					return {
						...oldData,
						columns: updatedColumns
					}
				})

				handleClose(null)
			}

			openPopup("success", "card deleted successfully");
		}
	}


	return (
		<CardModalContext.Provider value={{ showCardModal }}>
			{children}
			<Dialog as="div" className="relative z-50" onClose={() => handleClose(null)} open={isOpen}>
				{/* Backdrop */}
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
				</TransitionChild>

				{/* Modal container */}
				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<DialogPanel
								className="min-w-[340px] sm:min-w-[600px] transform overflow-hidden rounded-3xl shadow-xl transition-all bg-white"
							>
								<Formik
									initialValues={initialValues}
									onSubmit={onSubmit}
									validationSchema={ValidationSchema}
								>
									{({ isSubmitting, errors, values, setFieldValue, handleSubmit, handleChange }) => {
										return (
											<>
												{/* Content section */}
												<div className="" >

													<div className="flex justify-end w-full items-center p-2 border-b border-gray-200">
														<Menu as="div" className="relative inline-block">
															<MenuButton className="py-2 px-3 cursor-pointer font-normal inline-flex justify-between gap-x-1.5 rounded-md bg-white text-sm text-gray-900 inset-ring-0 data-focus:outline-hidden focus:outline-none">
																{values.status}
																<ChevronDownIcon aria-hidden="true" className="-mr-1 size-4 text-gray-400" />
															</MenuButton>

															<MenuItems
																transition
																className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
															>
																<div className="py-1">
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('status', "todo")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			Todo
																		</button>
																	</MenuItem>
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('status', "in-progress")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			In Progress
																		</button>
																	</MenuItem>
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('status', "done")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			Done
																		</button>
																	</MenuItem>
																</div>
															</MenuItems>
														</Menu>

														<div className="mx-3 h-6 w-px bg-gray-950/10"></div>

														<Menu as="div" className="relative inline-block">
															<MenuButton className="py-2 px-3 cursor-pointer font-normal inline-flex justify-between gap-x-1.5 rounded-md bg-white text-sm text-gray-900 inset-ring-0 data-focus:outline-hidden focus:outline-none">
																{values.priority}
																<ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
															</MenuButton>

															<MenuItems
																transition
																className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
															>
																<div className="py-1">
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('priority', "low")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			Low
																		</button>
																	</MenuItem>
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('priority', "medium")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			Medium
																		</button>
																	</MenuItem>
																	<MenuItem>
																		<button
																			onClick={() => setFieldValue('priority', "high")}
																			className="text-left w-full cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
																		>
																			High
																		</button>
																	</MenuItem>
																</div>
															</MenuItems>
														</Menu>

														<div className="mx-3 h-6 w-px bg-gray-950/10"></div>

														{options.mode === 'update' && (
															<button
																type="button"
																onClick={handleDelete}
																className="cursor-pointer py-2 px-3 text-sm text-gray-600 hover:text-gray-700 font-medium"
															>
																Delete
															</button>
														)}
													</div>

													<div className='p-4 mt-3'>

														<form onSubmit={handleSubmit} className="space-y-4">
															{/* Title Field */}
															<div>
																{!isTitleEditing && options.mode === 'update' && values.title ? (
																	<div className='flex flex-row justify-between'>
																		<h1
																			onClick={() => setIsTitleEditing(true)}
																			className="w-full text-xl font-bold text-gray-700 cursor-pointer hover:text-gray-900 mb-6"
																		>
																			{values.title}
																		</h1>
																		<button
																			type="button"
																			onClick={() => setIsTitleEditing(true)}
																			className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 font-medium p-2"
																		>
																			<PencilLineIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
																		</button>
																	</div>

																) : (
																	<>
																		<label htmlFor="card-title" className="block text-sm font-medium text-gray-700 mb-1">
																			Title <span className="text-red-500">*</span>
																		</label>
																		<Field
																			id="card-title"
																			as="textarea"
																			name="title"
																			type="text"
																			className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300`}
																			placeholder="Enter card title"
																			autoFocus={isTitleEditing && options.mode === 'update'}
																			onBlur={() => {
																				if (options.mode === 'update' && values.title) {
																					setIsTitleEditing(false)
																				}
																			}}
																		/>
																	</>
																)}
																<ErrorMessage name="title" component="div" className="text-sm text-red-600" />
															</div>
															{/* Description Field */}
															<div>
																{!isDescriptionEditing && options.mode === 'update' && values.description ? (
																	<>
																		<div className="flex items-center justify-between mb-3">
																			<div className="flex items-center gap-2">
																				<label className="text-base font-medium text-gray-700">
																					Description:
																				</label>
																			</div>
																			<button
																				type="button"
																				onClick={() => setIsDescriptionEditing(true)}
																				className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 font-medium p-2"
																			>
																				<PencilLineIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
																			</button>
																		</div>
																		<div
																			className="text-gray-700 leading-relaxed"
																			dangerouslySetInnerHTML={{ __html: values.description }}
																		/>
																	</>
																) : (
																	<>
																		<label htmlFor="card-description" className="block text-sm font-medium text-gray-700 mb-1">
																			Description
																		</label>
																		<TextEditor onChange={(html) => setFieldValue("description", html)} initialValue={values.description} />
																	</>
																)}
																<ErrorMessage name="description" component="div" className="text-sm text-red-600" />
															</div>

															{/* Action buttons */}
															<div className="flex flex-row-reverse space-x-4 pt-4">
																<Button
																	text={options.mode === 'create' ? 'Create Card' : 'Update Card'}
																	type="submit"
																	variant="primary"
																	disabled={isSubmitting}
																/>
															</div>
														</form>

													</div>
												</div>
											</>)
									}}
								</Formik>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</CardModalContext.Provider >
	)
}

export function useCardModal() {
	const context = useContext(CardModalContext)
	if (!context) {
		throw new Error('useCardModal must be used within a CardModalProvider')
	}
	return context
}
