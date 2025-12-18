import { Button } from '@/components/FormElements';
import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" id="content" role="content">
			<div className="flex justify-center mb-8">
				<img alt="" className="max-h-[160px]" src="/illustrations/404.svg" />
			</div>
			<div className="text-lg font-medium text-gray-900 text-center mb-4">
				Page Not Found
			</div>
			<div className="text-sm text-gray-700 text-center mb-5">
				We could not find the page you were looking for.
			</div>
			<div className="text-sm text-gray-700 text-center">
				<Button
					text="Back to Home"
					type="button"
					variant="primary"
					style=""
					href="/"
				/>
			</div>
		</main>
	);
}