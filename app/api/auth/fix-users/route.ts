// app/api/auth/fix-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Just show users, don't fix them on GET
        const users = await User.find({}).select('+password');

        const userInfo = users.map(user => ({
            email: user.email,
            name: user.name,
            passwordLength: user.password?.length,
            isHash: user.password?.startsWith('$2'),
            needsFix: user.password && user.password.length < 20,
        }));

        return NextResponse.json({
            success: true,
            message: `Found ${users.length} users`,
            users: userInfo,
            note: 'Use POST method to actually fix users'
        });

    } catch (error: any) {
        console.error('Get users error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        // Get all users with short passwords (likely plain text)
        const users = await User.find({}).select('+password');

        const fixedUsers = [];

        for (const user of users) {
            // Check if password looks like plain text (less than 20 chars)
            if (user.password && user.password.length < 20) {
                console.log(`Fixing user: ${user.email}`);
                console.log(`Current password: ${user.password} (length: ${user.password.length})`);

                // If password is short, assume it's plain text and hash it
                const hashedPassword = await bcrypt.hash(user.password, 12);
                user.password = hashedPassword;
                await user.save();

                fixedUsers.push({
                    email: user.email,
                    originalLength: user.password.length, // This is now the hash length
                    isFixed: true,
                });
            } else {
                fixedUsers.push({
                    email: user.email,
                    passwordLength: user.password?.length,
                    isHash: user.password?.startsWith('$2'),
                    isFixed: false,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked ${users.length} users`,
            fixedUsers,
            fixedCount: fixedUsers.filter(u => u.isFixed).length,
            note: 'Users with short passwords were re-hashed'
        });

    } catch (error: any) {
        console.error('Fix users error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}