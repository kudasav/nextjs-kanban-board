"use client";

import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode } from "react";
import { FetchUser } from "@/actions/authentication";
import { UserType } from "@/types";
import Loader from "./PageLoader";

interface UserContextType {
    user: UserType | undefined;
    setUser: Dispatch<SetStateAction<UserType | undefined>>;
    userLoading: boolean;
    LoadUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType>();
    const [userLoading, setUserLoading] = useState(true)

    const LoadUser = async () => {
        const response = await FetchUser();
        if (response.success) {
            setUser(response.result);
        } 
        
        setUserLoading(false);
    };

    useEffect(() => {
        LoadUser();
    }, []);

    if (userLoading) return <Loader />;

    return (
        <UserContext.Provider value={{ user, setUser, userLoading, LoadUser }}>
            {children}
        </UserContext.Provider>
    );
};
