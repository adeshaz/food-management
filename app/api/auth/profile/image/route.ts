// app/api/auth/profile/image/route.ts - WITHOUT UUID
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (jwtError) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('profileImage') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No image provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'Image size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Generate unique filename without uuid
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const filename = `profile-${timestamp}-${randomStr}.${fileExtension}`;

        // Create upload directories
        const uploadRoot = path.join(process.cwd(), 'public');
        const uploadDir = path.join(uploadRoot, 'uploads', 'profiles');

        // Create directories recursively
        await fs.mkdir(uploadDir, { recursive: true });

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, buffer);

        // Create relative URL (accessible from browser)
        const imageUrl = `/uploads/profiles/${filename}`;

        console.log('✅ Image saved to:', filepath);
        console.log('🌐 Image URL:', imageUrl);

        // Connect to database
        await connectToDatabase();

        // Update user profile with new image
        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { profileImage: imageUrl },
            { new: true }
        ).select('-password');

        return NextResponse.json({
            success: true,
            message: 'Profile image updated successfully',
            imageUrl,
            user: updatedUser
        });

    } catch (error: any) {
        console.error('❌ Error uploading profile image:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}