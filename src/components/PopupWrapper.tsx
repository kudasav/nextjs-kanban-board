"use client"; // Ensures this runs on the client

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Transition } from '@headlessui/react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface PopupContextType {
    openPopup: (notificationType: string, message: string) => void;
    closePopup: () => void;
}

type NotificationType = "error" | "success";

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, SetContent] = useState({
        type: "",
        message: ""
    })

    const openPopup = (notificationType: NotificationType, message: string) => {
        SetContent({
            type: notificationType,
            message: message
        })
        setIsOpen(true);

        // close the pop up after 3 seconds
        setTimeout(() => {setIsOpen(false)}, 3000)
    };

    const closePopup = () => {
        setIsOpen(false);
    };

    return (
        <PopupContext.Provider value={{ openPopup, closePopup }}>
            {children}

            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 "
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    <Transition show={isOpen}>
                        <div className={`${content.type == 'error' ? 'bg-red-50' : 'bg-green-50'} absolute bottom-4 right-0 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0`}>
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div className="shrink-0">
                                        {content.type =="error"?
                                            <XCircle aria-hidden="true" className="size-6 text-red-400" />
                                            :
                                            <CheckCircle aria-hidden="true" className="size-6 text-green-400" />
                                        }
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-gray-900">{content.message}</p>
                                    </div>
                                    <div className="ml-4 flex shrink-0">
                                        <button
                                            type="button"
                                            onClick={closePopup}
                                            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <span className="sr-only">Close</span>
                                            <X aria-hidden="true" className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </PopupContext.Provider>
    );
};


export const usePopup = () => {

    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupWrapper");
    }
    return context;
};
