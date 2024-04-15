export const downloadImage = async (updatedCID: string, r2Bucket: R2Bucket): Promise<{ success: boolean; errorCode?: number }> => {
  const imageURL = `https://cloudflare-ipfs.com/ipfs/${updatedCID}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

  try {
      const response = await fetch(imageURL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
          let errorCode;
          switch (response.status) {
              case 422: errorCode = 2; break;
              case 404: errorCode = 3; break;
              case 403: errorCode = 4; break;
              case 500: errorCode = 5; break;
              default: errorCode = 6; break;
          }
          return { success: false, errorCode };
      }

      const imageBlob = await response.blob();
      await r2Bucket.put(updatedCID, imageBlob);
      return { success: true };
  } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
          return { success: false, errorCode: 1 }; // Timeout error
      }
      return { success: false, errorCode: 6 }; // Other errors
  }
};
