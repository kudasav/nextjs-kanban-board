import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { CardModalProvider } from "@/components/CardModal";
import { UserProvider } from "@/components/UserContext";

export const metadata: Metadata = {
	title: "DAAily Kanban",
	description: "A simple and efficient kanban board to manage your tasks and projects.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className={`max-w-[1320px] mx-auto`}>
			<UserProvider>
				<NavBar />
				<CardModalProvider>
					{children}
				</CardModalProvider>
			</UserProvider>
		</div>
	);
}
