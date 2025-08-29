import { ImageAsset, CropData } from '../types';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const resizeImageForApi = async (uri: string, maxSize: number = 2048): Promise<string> => {
  try {
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { format: 'png' });
    
    if (imageInfo.width <= maxSize && imageInfo.height <= maxSize) {
      return imageInfo.uri;
    }

    const ratio = Math.min(maxSize / imageInfo.width, maxSize / imageInfo.height);
    const newWidth = Math.round(imageInfo.width * ratio);
    const newHeight = Math.round(imageInfo.height * ratio);

    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { format: 'png', compress: 0.9 }
    );

    return resizedImage.uri;
  } catch (error) {
    console.error('Image resize failed:', error);
    throw new Error('Failed to resize image');
  }
};

export const cropImage = async (uri: string, cropData: CropData): Promise<string> => {
  try {
    const croppedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: cropData.x,
            originY: cropData.y,
            width: cropData.width,
            height: cropData.height,
          },
        },
      ],
      { format: 'png', compress: 0.9 }
    );

    return croppedImage.uri;
  } catch (error) {
    console.error('Image crop failed:', error);
    throw new Error('Failed to crop image');
  }
};

export const rotateImage = async (uri: string, degrees: number): Promise<string> => {
  try {
    const rotatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: degrees }],
      { format: 'png', compress: 0.9 }
    );

    return rotatedImage.uri;
  } catch (error) {
    console.error('Image rotation failed:', error);
    throw new Error('Failed to rotate image');
  }
};

export const flipImage = async (uri: string, direction: 'horizontal' | 'vertical'): Promise<string> => {
  try {
    const flipAction = direction === 'horizontal' ? { flip: 'horizontal' as const } : { flip: 'vertical' as const };
    
    const flippedImage = await ImageManipulator.manipulateAsync(
      uri,
      [flipAction],
      { format: 'png', compress: 0.9 }
    );

    return flippedImage.uri;
  } catch (error) {
    console.error('Image flip failed:', error);
    throw new Error('Failed to flip image');
  }
};

export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error('Image file does not exist');
    }

    // For getting actual dimensions, we need to manipulate the image
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {});
    
    return {
      width: imageInfo.width,
      height: imageInfo.height,
    };
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    throw new Error('Failed to get image dimensions');
  }
};

export const compressImage = async (uri: string, compress: number = 0.8): Promise<string> => {
  try {
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: 'jpeg', compress }
    );

    return compressedImage.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

export const convertToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Base64 conversion failed:', error);
    throw new Error('Failed to convert image to base64');
  }
};

export const saveImageToDevice = async (uri: string, filename?: string): Promise<string> => {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) {
      throw new Error('Document directory not available');
    }

    const newFilename = filename || `edited_image_${Date.now()}.png`;
    const newPath = `${documentDirectory}${newFilename}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    return newPath;
  } catch (error) {
    console.error('Save image failed:', error);
    throw new Error('Failed to save image');
  }
};

export const deleteTemporaryImage = async (uri: string): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.warn('Failed to delete temporary image:', error);
  }
};

export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

export const getAspectRatioConstraints = (aspectRatio: number | null) => {
  if (aspectRatio === null) return undefined;
  
  const ratios: { [key: number]: { width: number; height: number } } = {
    1: { width: 1, height: 1 }, // 1:1
    1.777: { width: 16, height: 9 }, // 16:9
    0.5625: { width: 9, height: 16 }, // 9:16
    1.333: { width: 4, height: 3 }, // 4:3
    0.75: { width: 3, height: 4 }, // 3:4
  };

  const closest = Object.keys(ratios).reduce((prev, curr) => {
    return Math.abs(parseFloat(curr) - aspectRatio) < Math.abs(parseFloat(prev) - aspectRatio) ? curr : prev;
  });

  return ratios[parseFloat(closest)];
};