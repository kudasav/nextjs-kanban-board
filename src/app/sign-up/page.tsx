"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from "yup";
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/FormElements";
import { Register } from "@/actions/authentication";
import { useRouter } from "next/navigation";

interface FormValues {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const LoginValidationSchema = Yup.object({
	firstName: Yup.string().required("First Name is required"),
	lastName: Yup.string().required("Last Name is required"),
	email: Yup.string().email("Invalid email format").required("Email is required"),
	password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
		.required('Confirm Password is required'),
})

const INITIAL_VALUES = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	confirmPassword: ""
};



export default function LoginPage() {
	const [formData, setFormData] = useState<any>({});
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const Submit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
		let data = { ...formData, ...values };

		try {
			await Register(data.email, data.password, data.firstName, data.lastName);
			router.push("/");
		} catch (error) {
			setError("An error occurred, please try again later")
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">

			{/* Login Card */}
			<div className="relative z-10 bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
				{/* Logo */}
				<div className="flex items-center justify-center mb-6">
					<Link href="/" className="flex items-center gap-2 mt-2">
						<Image src="/brand.png" alt="DAAily Kanban" width={200} height={57} />
					</Link>
				</div>

				<Formik
					initialValues={INITIAL_VALUES}
					onSubmit={Submit}
					validationSchema={LoginValidationSchema}
				>
					{({ isSubmitting, errors, values, setFieldValue, handleSubmit, handleChange }) => (
						<form onSubmit={handleSubmit} className="space-y-6">
							<legend className="text-sm/6 font-semibold text-gray-700">Please enter your details to create your {formData.role} account</legend>
							<div>
								<label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
									First Name <span className="text-red-500">*</span>
								</label>
								<Field
									type="text"
									id="first-name"
									name="firstName"
									placeholder=""
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<ErrorMessage name="firstName" component="div" className="text-sm text-red-600" />
							</div>
							<div>
								<label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
									Last Name <span className="text-red-500">*</span>
								</label>
								<Field
									type="text"
									id="last-name"
									name="lastName"
									placeholder="Doe"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<ErrorMessage name="lastName" component="div" className="text-sm text-red-600" />
							</div>
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<Field
									type="tel"
									id="email"
									name="email"
									placeholder="email@example.com"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<ErrorMessage name="email" component="div" className="text-sm text-red-600" />
							</div>
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<Field
									type="password"
									id="password"
									name="password"
									placeholder="********"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<ErrorMessage name="password" component="div" className="text-sm text-red-600" />
							</div>
							<div>
								<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
									Confirm Password
								</label>
								<Field
									type="password"
									id="confirm-password"
									name="confirmPassword"
									placeholder="********"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-600" />
							</div>

							{error &&
								<div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
									<div className="flex">
										<div className="shrink-0">
											<TriangleAlert aria-hidden="true" className="size-5 text-yellow-400" />
										</div>
										<div className="ml-3">
											<p className="text-sm text-yellow-700">
												{error}
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
					)}
				</Formik>
			</div>
		</div>
	);
}
