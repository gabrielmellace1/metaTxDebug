export async function uploadToR2(r2, key, data, contentType) {
    try {
        const res = await r2.put(key, new Blob([data], { type: contentType }), {
            httpMetadata: { contentType }
        });
        return res;
    } catch (error) {
        console.error('Failed to upload to R2:', error);
        throw error;
    }
}
