// Handles downloading images from IPFS and returns success status

export const downloadImage = async (updatedCID: string, r2Bucket: R2Bucket): Promise<boolean> => {
  const imageURL = `https://ipfs.io/ipfs/${updatedCID}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);  // Increase timeout to 1 minute

  try {
    const response = await fetch(imageURL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Failed to download image');
    const imageBlob = await response.blob();
    await r2Bucket.put(updatedCID, imageBlob);
    return true;  // Success
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Download timeout for CID:', updatedCID);
      return false;  // Indicate a timeout
    }
    throw error;
  }
};


  