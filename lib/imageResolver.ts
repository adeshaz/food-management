type ImageSource = {
    src: string;
    provider: 'cloudinary' | 'unsplash' | 'local';
};

export function resolveImageUrl(
    image: ImageSource | string | undefined | null,
    width = 600,
    height = 400
) {
    // If no image, return placeholder
    if (!image) return '/images/food-placeholder.jpg';

    // If image is just a string (legacy or direct URL)
    if (typeof image === 'string') return image;

    switch (image.provider) {
        case 'cloudinary':
            // Uses your Cloudinary account and parameters
            return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},h_${height},c_fill/${image.src}`;

        case 'unsplash': {
            // Preserve any existing query params safely
            const separator = image.src.includes('?') ? '&' : '?';
            return `${image.src}${separator}auto=format&fit=crop&w=${width}&q=80`;
        }

        case 'local':
            // Local path relative to /public
            return image.src;

        default:
            return '/images/food-placeholder.jpg';
    }
}
