import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign in - DAAily Kanban",
	description: "Sign in to your DAAily Kanban account to manage your listings and make bookings.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
