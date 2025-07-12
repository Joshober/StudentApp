import { FileUpload } from '@/types';

// Function to convert a file to base64 for transmission and storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Function to extract text from file (for text-based files)
export const extractTextFromFile = async (file: File): Promise<string | null> => {
  try {
    if (file.type.startsWith('text/') || file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }
    
    // For image files, we'd need OCR which would typically be handled server-side
    // For now, just return null for non-text files
    return null;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return null;
  }
};

// Function to generate a file preview
export const generatePreview = (file: File): string => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  
  // Return appropriate icon based on file type
  if (file.type === 'application/pdf') {
    return '/icons/pdf.svg';
  } else if (file.type.includes('word')) {
    return '/icons/word.svg';
  } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
    return '/icons/excel.svg';
  } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
    return '/icons/powerpoint.svg';
  }
  
  // Default file icon
  return '/icons/file.svg';
};

// Mock storage function (in a real app, this would upload to a server)
export const storeFile = async (file: File): Promise<FileUpload> => {
  const content = await extractTextFromFile(file);
  const url = URL.createObjectURL(file);
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: file.name,
    type: file.type,
    size: file.size,
    url,
    content,
    createdAt: new Date(),
  };
};