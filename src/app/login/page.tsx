"use client";

import React, { useContext, useState } from "react";
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from "yup";
import { Login } from "@/actions/authentication";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import { TriangleAlert } from "lucide-react";
import SocialLogin from "@/components/SocialLogin";
import { Button } from "@/components/FormElements";

interface FormValues {
	email: string;
	password: string;
}

const LoginValidationSchema = Yup.object({
	email: Yup.string().email("Invalid email format").required("Email is required"),
	password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
})

const INITIAL_VALUES = {
	email: "",
	password: ""
};


export default function LoginPage() {
	const searchParams = useSearchParams();
	const next = searchParams.get("next");
	const error = searchParams.get("error");
	const [formError, setFormError] = useState<string | null>(error);
	const router = useRouter();

	const Submit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
		try {
			try{
				await Login(values.email, values.password);
			} catch(error: any){
				return setFormError(error.message || "Login failed, invalid email or password.");
			}

			router.push(next || "/")
		} catch (error) {
			setFormError("An unexpected error occurred. Please try again.");
		}
	}

	return (<>
		<div className="min-h-screen bg-white sm:bg-gray-100 flex items-center justify-center">

			{/* Login Card */}
			<div className="relative z-10 bg-white rounded-lg sm:border sm:border-gray-200 sm:shadow p-8 w-full max-w-md">
				{/* Logo */}
				<div className="flex items-center justify-center mb-6">
					<Link href="/" className="flex items-center gap-2 mt-2">
						<Image src="/brand.png" alt="DAAily Kanban" width={200} height={57} />
					</Link>
				</div>

				{/* Title */}
				<h2 className="text-gray-700 text-sm mb-2 font-medium">
					Please sign in to your account
				</h2>
				<Formik
					initialValues={INITIAL_VALUES}
					onSubmit={Submit}
					validationSchema={LoginValidationSchema}
				>
					{({ isSubmitting, handleSubmit }) => (
						<>
							<form className="space-y-8" onSubmit={handleSubmit}>
								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
										Email <span className="text-red-500">*</span>
									</label>
									<Field
										type="email"
										name="email"
										id="email"
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
										placeholder="email"
									/>
									<ErrorMessage name="email" component="div" className="text-sm text-red-600 mt-1" />
								</div>

								<div>
									<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
										Password <span className="text-red-500">*</span>
									</label>
									<Field
										type="password"
										name="password"
										id="password"
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
										placeholder="password"
									/>
									<ErrorMessage name="password" component="div" className="text-sm text-red-600 mt-1" />
								</div>

								{formError &&
									<div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
										<div className="flex">
											<div className="shrink-0">
												<TriangleAlert aria-hidden="true" className="size-5 text-yellow-400" />
											</div>
											<div className="ml-3">
												<p className="text-sm text-yellow-700">
													{formError}
												</p>
											</div>
										</div>
									</div>
								}

								{/* Continue Button */}
								<Button
									text="Continue"
									type="submit"
									variant="primary"
									style="w-full"
									loading={isSubmitting}
								/>
							</form>

							{/* Divider */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-200"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-4 bg-white text-gray-500">Or continue with:</span>
								</div>
							</div>

							{/* Social Login Buttons */}
							<SocialLogin next={next} />
						</>
					)}
				</Formik>
				{/* Footer Links */}
				<div className="mt-6 text-center space-y-4">
					<div className="flex items-center justify-center gap-2 text-sm">
						<Link href="#" className="text-cyan-600 hover:text-cyan-700 hover:underline">
							Forgot Password?
						</Link>
						<span className="text-gray-400">•</span>
						<Link href="/sign-up" className="text-cyan-600 hover:text-cyan-700 hover:underline">
							Create an account
						</Link>
					</div>
				</div>
			</div>
		</div>
	</>);
}