"use client"

import { createContext, useContext, useState, useCallback, ReactNode, Fragment } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import {
	XIcon,
	TriangleAlertIcon
} from 'lucide-react'
import { Button } from './FormElements'

interface ConfirmationOptions {
	title: string
	description: string
	action: string
}

interface ConfirmationContextType {
	showConfirmation: (opts: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	const [options, setOptions] = useState<ConfirmationOptions>({
		title: '',
		description: '',
		action: 'Confirm'
	})
	const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

	const showConfirmation = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
		setOptions(opts)
		setIsOpen(true)

		return new Promise<boolean>((resolve) => {
			setResolvePromise(() => resolve)
		})
	}, [])

	const handleClose = useCallback((result: boolean) => {
		setIsOpen(false)
		if (resolvePromise) {
			resolvePromise(result)
			setResolvePromise(null)
		}
	}, [resolvePromise])

	return (
		<ConfirmationContext.Provider value={{ showConfirmation }}>
			{children}
			<Dialog as="div" className="relative z-50" onClose={handleClose} open={isOpen}>
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
								className={`max-w-[320px] transform overflow-hidden rounded-3xl shadow-xl transition-all bg-white`}
							>
								<div className={`relative w-full flex items-end justify-center`}>
									<div className={`mt-8 w-20 h-20  flex items-center justify-center z-10`}>
										<TriangleAlertIcon aria-hidden="true" className="size-18 text-amber-600" />
									</div>

									<div className={`h-[700px] w-[700px] top-[-550px] flex items-end justify-center overflow-hidden absolute rounded-full bg-amber-100`}></div>
								</div>

								{/* Content section */}
								<div className="px-8 py-6 text-center mt-14">
									<h3 className={`text-xl font-semibold mb-3 text-gray-700`}>
										{options.title}
									</h3>
									<p className="text-gray-700 text-md mb-8">
										{options.description}
									</p>

									{/* Action button */}
									<div className="flex justify-between space-x-4">

										<Button
											text="Cancel"
											type="button"
											variant="secondary"
											onClick={() => handleClose(false)}
										/>
										<Button
											text={options.action}
											type="button"
											variant="primary"
											onClick={() => handleClose(true)}
										/>
									</div>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</ConfirmationContext.Provider>
	)
}

export function useConfirmation() {
	const context = useContext(ConfirmationContext)
	if (!context) {
		throw new Error('useConfirmation must be used within a ConfirmationProvider')
	}
	return context
}