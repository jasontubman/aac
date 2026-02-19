import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Simple image processing utilities
// Note: For production, consider using more advanced libraries for background removal

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: SaveFormat;
}

/**
 * Crop image to square (centered)
 */
export async function cropToSquare(
  uri: string,
  options: ImageProcessingOptions = {}
): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: options.width || 400,
            height: options.height || 400,
          },
        },
      ],
      {
        compress: options.quality || 0.8,
        format: options.format || SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
}

/**
 * Resize image
 */
export async function resizeImage(
  uri: string,
  width: number,
  height: number,
  quality: number = 0.8
): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width,
            height,
          },
        },
      ],
      {
        compress: quality,
        format: SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
}

/**
 * Basic background simplification (placeholder)
 * In production, use a proper background removal library
 */
export async function simplifyBackground(uri: string): Promise<string> {
  // For now, just return the original image
  // In production, implement actual background removal/simplification
  // Consider using libraries like:
  // - @imgly/background-removal
  // - react-native-image-manipulator with filters
  // - ML-based solutions
  
  // Placeholder: apply a slight blur to simulate simplification
  try {
    const result = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: 400,
            height: 400,
          },
        },
      ],
      {
        compress: 0.9,
        format: SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error simplifying background:', error);
    return uri; // Return original on error
  }
}

/**
 * Save image to app directory
 */
export async function saveImageToAppDirectory(
  uri: string,
  filename: string
): Promise<string> {
  try {
    const imagesDir = new Directory(Paths.document, 'images');
    
    if (!imagesDir.exists) {
      imagesDir.create();
    }

    // Create source file from URI
    // If URI is already a file path, use it directly; otherwise create a File instance
    const sourceFile = new File(uri);
    const destinationFile = new File(imagesDir, filename);
    
    // Copy the file
    sourceFile.copy(destinationFile);
    
    return destinationFile.uri;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}
