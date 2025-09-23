import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Helper function untuk generate URL dengan transformasi
export const generateImageUrl = (filePath, transformation = {}) => {
  if (!filePath) return null;
  
  const { width, height, crop = 'maintain_ratio', quality = 'auto' } = transformation;
  
  let transformStr = `q-${quality}`;
  if (width) transformStr += `,w-${width}`;
  if (height) transformStr += `,h-${height}`;
  if (crop) transformStr += `,c-${crop}`;
  
  return `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}?tr=${transformStr}`;
};

// Helper function untuk generate multiple size versions
export const generateImageUrls = (filePath) => {
  if (!filePath) return null;
  
  const baseUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}`;
  
  return {
    original: baseUrl,
    thumbnail: `${baseUrl}?tr=w-150,h-150,c-maintain_ratio,q-auto`,
    small: `${baseUrl}?tr=w-300,h-300,c-maintain_ratio,q-auto`,
    medium: `${baseUrl}?tr=w-500,h-500,c-maintain_ratio,q-auto`,
    large: `${baseUrl}?tr=w-800,h-800,c-maintain_ratio,q-auto`,
    // Untuk card/list view
    card: `${baseUrl}?tr=w-250,h-200,c-maintain_ratio,q-auto`,
    // Untuk detail view
    detail: `${baseUrl}?tr=w-600,h-400,c-maintain_ratio,q-auto`
  };
};
