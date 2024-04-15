export const downloadImage = async (updatedCID: string): Promise<{ success: boolean; blob?: Blob; contentType?: string; errorCode?: number }> => {
  const imageURL = `https://cloudflare-ipfs.com/ipfs/${updatedCID}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

  try {
      const response = await fetch(imageURL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
          return { success: false, errorCode: determineErrorCode(response.status) };
      }

      const imageBlob = await response.blob();
      const contentType = response.headers.get("Content-Type") || 'application/octet-stream';
      return { success: true, blob: imageBlob, contentType };
  } catch (error) {
      clearTimeout(timeoutId);
      return { success: false, errorCode: error.name === 'AbortError' ? 1 : 6 };
  }
};

export const uploadToR2 = async (updatedCID: string, blob: Blob, contentType: string, r2Bucket: R2Bucket): Promise<boolean> => {
  try {
      await r2Bucket.put(updatedCID, blob, {
          httpMetadata: {
              contentType: contentType
          }
      });
      return true;
  } catch (error) {
      console.error('Error uploading to R2:', error);
      return false;
  }
};

function determineErrorCode(status: number): number {
  switch (status) {
      case 422: return 2;
      case 404: return 3;
      case 403: return 4;
      case 500: return 5;
      default: return 6;
  }
}
