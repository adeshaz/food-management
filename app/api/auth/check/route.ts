import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 200 });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;

            return NextResponse.json({
                authenticated: true,
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    name: decoded.name,
                },
            });
        } catch (error) {
            return NextResponse.json({ authenticated: false }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }
}