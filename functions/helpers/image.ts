export const downloadImage = async (updatedCID: string, r2Bucket: R2Bucket): Promise<{ success: boolean; error?: string }> => {
  const imageURL = `https://ipfs.io/ipfs/${updatedCID}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);  // 1 minute timeout

  try {
    const response = await fetch(imageURL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YourBot/0.1; +http://yourdomain.com/bot.html)'
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return { success: false, error: `Failed to download image: ${response.statusText} (Status code: ${response.status})` };
    }

    const contentType = response.headers.get('Content-Type');
    console.log('Downloaded Content Type:', contentType);  // Log the content type for debugging

    const imageBlob = await response.blob();
    await r2Bucket.put(updatedCID, imageBlob, {
      httpMetadata: {
        contentType: contentType  // Set the correct Content-Type in R2
      }
    });
    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, error: 'Timeout: Image download operation timed out.' };
    }
    return { success: false, error: `Download error: ${error.message}` };
  }
};
