'use client'

import Link from 'next/link'
import PulseLoader from "react-spinners/PulseLoader";

interface Props {
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    text: string;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
    style?: string;
}

export default function Component({
    disabled,
    onClick,
    text,
    type = 'button',
    href,
    variant = 'primary',
    icon,
    style,
    loading
}: Props) {

    const className = `col-span-1 inline-flex items-center justify-center gap-2 rounded-md min-h-10 min-w-[120px] ${variant === 'primary' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-white border border-gray-300 text-gray-600'} px-3 py-2 font-medium text-sm cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${style}`

    return (
        href ? (
            <Link
                href={href}
                className={className}
            >
                {icon && icon}
                {text}
            </Link>
        ) : (
            <button
                type={type}
                disabled={disabled || loading}
                onClick={onClick}
                className={className}
            >
                {loading ?
                    <PulseLoader color={"#fff"} loading={true} size={8} />
                    :
                    <>{icon && icon}{text}</>
                }
            </button>
        )
    )
}
