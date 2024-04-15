// Handles downloading images from IPFS and returns success status

export const downloadImage = async (updatedCID: string, r2Bucket: R2Bucket): Promise<boolean> => {
  const imageURL = `https://ipfs.io/ipfs/${updatedCID}`;
  try {
    const response = await fetch(imageURL);
    if (!response.ok) throw new Error('Failed to download image');

    const imageBlob = await response.blob();
    await r2Bucket.put(updatedCID, imageBlob);

    return true; // Indicate success
  } catch (error) {
    console.error('Error downloading or saving image:', error);
    return false; // Indicate failure
  }
};

  