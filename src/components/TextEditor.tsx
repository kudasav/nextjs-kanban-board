'use client';

import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

export default function QuillEditor({
	onChange,
	initialValue = '',
}: {
	onChange?: (content: string) => void;
	initialValue?: string;
}) {
	const editorRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<any>(null);

	useEffect(() => {
		import('quill').then((QuillModule) => {
			const Quill = QuillModule.default;

			if (editorRef.current && !quillRef.current) {
				quillRef.current = new Quill(editorRef.current, {
					theme: 'snow',
					modules: {
						toolbar: [
							[{ header: [1, 2, false] }],
							['bold', 'italic', 'underline'],
							[{ list: 'ordered' }, { list: 'bullet' }]
						],
					},
				});

				// Set initial value
				if (initialValue) {
					quillRef.current.root.innerHTML = initialValue;
				}

				quillRef.current.on('text-change', () => {
					const html = quillRef.current.root.innerHTML;
					onChange?.(html);
				});
			}
		});
	}, [onChange, initialValue]);

	return <div
		ref={editorRef}
		style={{
			minHeight: '200px',
			display: 'flex',
			flexDirection: 'column'
		}}
		className="quill-container"
	/>;
}