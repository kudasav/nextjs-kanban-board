"use server";

import { UserType, ActionResult } from "@/types";
import { ServerClient } from '@/database';
import { createHash } from 'node:crypto';
import * as jose from 'jose'
import { cookies } from 'next/headers';

export async function Register(email: string, password: string, firstName: string, lastName: string): Promise<UserType> {
    const supabase = ServerClient();
    const passwordHash = createHash('sha256').update(password).digest('hex');

    const { data, error } = await supabase
        .from('users')
        .insert({
            email,
            passwordHash,
            firstName,
            lastName
        })
        .select()
        .single();

    if (error) {
        throw new Error("Unable to register user: " + error.message);
    }

    const token = await new jose.SignJWT({ userId: data.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

   
    (await cookies()).set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return data as UserType;
}

export async function Login(email: string, password: string): Promise<UserType> {
    const supabase = ServerClient();
    const passwordHash = createHash('sha256').update(password).digest('hex');

    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .eq('passwordHash', passwordHash)
        .single();

    if (error) {
        throw new Error("Invalid email or password");
    }

    const token = await new jose.SignJWT({ userId: data.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

   
    (await cookies()).set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return data as UserType;
}

export async function LoginSSO(code: string): Promise<ActionResult<UserType>> {
    try {
        const supabase = ServerClient();
        
        // Exchange the authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            return {
                success: false,
                result: {} as UserType,
                error: "Failed to exchange authorization code"
            };
        }

        const tokens = await tokenResponse.json();
        
        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            return {
                success: false,
                result: {} as UserType,
                error: "Failed to fetch user info from Google"
            };
        }

        const googleUser = await userInfoResponse.json();
        
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select()
            .eq('email', googleUser.email)
            .maybeSingle();

        let user;
        
        if (existingUser) {
            // User exists, use existing user
            user = existingUser;
        } else {
            // Create new user account
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: googleUser.email,
                    firstName: googleUser.given_name || '',
                    lastName: googleUser.family_name || '',
                    passwordHash: null // OAuth users don't have passwords
                })
                .select()
                .single();

            if (insertError) {
                return {
                    success: false,
                    result: {} as UserType,
                    error: "Unable to create user account: " + insertError.message
                };
            }

            user = newUser;
        }

        // Generate JWT token
        const token = await new jose.SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        // Set authentication cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return {
            success: true,
            result: user as UserType
        };
    } catch (error) {
        return {
            success: false,
            result: {} as UserType,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

export async function FetchUser(): Promise<ActionResult<UserType>> {
    const supabase = ServerClient();
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return {
            success: false,
            result: {} as UserType,
            error: "No authentication token found"
        };
    }

    let userId: number;
    try {
        const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        userId = (payload as any).userId;
    } catch (e) {
        return {
            success: false,
            result: {} as UserType,
            error: "Invalid authentication token"
        };
    }

    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();
    if (error) {
        return {
            success: false,
            result: {} as UserType,
            error: "User not found"
        };
    }

    return {
        success: true,
        result: data as UserType
    };
}