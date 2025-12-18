"use client";

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { PopupWrapper } from "./PopupWrapper";
import { ConfirmationProvider } from '@/components/ConfimationModal';
import { Suspense } from 'react';
import Loader from './PageLoader';

const queryClient = new QueryClient()

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loader />}>
            <ConfirmationProvider>
                <PopupWrapper>
                    {children}
                </PopupWrapper>
            </ConfirmationProvider>
        </Suspense>
    </QueryClientProvider>

}
