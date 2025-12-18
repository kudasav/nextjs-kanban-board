"use client";

import { UserProvider } from "@/components/UserContext";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { PopupWrapper } from "./PopupWrapper";
import { ConfirmationProvider } from '@/components/ConfimationModal';

const queryClient = new QueryClient()

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <QueryClientProvider client={queryClient}>
        <PopupWrapper>
            <UserProvider>
                <ConfirmationProvider>
                    {children}
                </ConfirmationProvider>
            </UserProvider>
        </PopupWrapper>
    </QueryClientProvider>

}
