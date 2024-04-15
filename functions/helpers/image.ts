// Handles downloading images from IPFS and returns success status

export const downloadImage = async (updatedCID: string, r2Bucket: R2Bucket): Promise<{ success: boolean; error?: string }> => {
  const imageURL = `https://ipfs.io/ipfs/${updatedCID}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);  // 1 minute timeout

  try {
    const response = await fetch(imageURL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return { success: false, error: `Failed to download image: ${response.statusText}` };
    }

    const imageBlob = await response.blob();
    await r2Bucket.put(updatedCID, imageBlob);
    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, error: 'Timeout' };  // Specifically handling timeout as a distinct error
    }
    return { success: false, error: `Download error: ${error.message}` };
  }
};


  