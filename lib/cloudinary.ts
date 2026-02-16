// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface UploadOptions {
    folder?: string;
    public_id?: string;
    transformation?: any[];
}

export async function uploadToCloudinary(
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: options.folder || 'uploads',
                    public_id: options.public_id,
                    transformation: options.transformation || [
                        { width: 500, height: 500, crop: 'fill' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        resolve({ success: false, error: error.message });
                    } else if (result) {
                        resolve({ success: true, data: result });
                    } else {
                        resolve({ success: false, error: 'Upload failed' });
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    } catch (error: any) {
        console.error('Cloudinary upload exception:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}