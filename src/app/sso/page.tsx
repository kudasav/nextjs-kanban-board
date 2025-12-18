"use client";

import { LoginSSO } from "@/actions/authentication";
import Loader from "@/components/PageLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Page() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const parsedState = state ? JSON.parse(state) : null;
	const next = parsedState?.next || null;
	const router = useRouter();;

	useEffect(() => {
		const validateToken = async () => {
			if (!code) {
				router.push("/login?error=Missing authorization code");
				return;
			}

			const result = await LoginSSO(code);
			if (!result.success) {
				router.push("/login?error=" + result.error);
				return;
			}
			
			router.push(next || "/dashboard");
		};

		validateToken();
	}, [code, router]);

	return <Loader />;
}
