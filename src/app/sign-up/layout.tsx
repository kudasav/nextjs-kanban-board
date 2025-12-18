import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign Up - DAAily Kanban",
	description: "Create a DAAily Kanban account to make bookings and manage your listings.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
