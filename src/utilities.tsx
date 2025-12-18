import * as jose from 'jose'

export async function VerifyToken(token: string): Promise<{ userId: string } | null> {
    if (token === '') return null;
    
    try {
        const { payload } = await jose.jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );
        return payload as { userId: string };
    }
    catch (error) {
        return null;
    }
}