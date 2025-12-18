"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';
import { useContext } from "react";
import { UserContext } from "@/components/UserContext";


export default function NavBar() {
    const router = useRouter();
    const { user, LoadUser } = useContext(UserContext);

    const handleSignout = () => {
        Cookies.remove('token')
        router.push("/login")
    }

    return (
        <div className="mb-3 flex items-center justify-between mt-8 px-4">
            <Link href="/dashboard">
                <img src="/brand.png" alt="DAAily Kanban" className="h-11 w-auto" />
            </Link>
            <Menu as="div" className="relative inline-block">
                <MenuButton className="cursor-pointer flex justify-center items-center rounded-full text-gray-700 hover:text-gray-800 focus-visible:outline-none focus-visible:outline-none focus-visible:outline-none">
                    <div className="flex items-center">
                        <span className="inline-block size-8 overflow-hidden rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="size-full text-gray-300">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </span>

                        <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Profile</p>
                        </div>
                    </div>
                </MenuButton>

                <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                    <div className="py-1">
                        <MenuItem>
                            <button
                                onClick={handleSignout}
                                className="cursor-pointer block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                            >
                                Sign out
                            </button>
                        </MenuItem>
                    </div>
                </MenuItems>
            </Menu>
        </div>
    )
}