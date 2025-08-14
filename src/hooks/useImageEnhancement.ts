import { useState } from 'react';
import { ImageEnhancer, ImageEnhancementOptions } from '../utils/imageEnhancer';

export function useImageEnhancement() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);

  const enhanceImage = async (
    file: File, 
    options?: ImageEnhancementOptions
  ): Promise<File | null> => {
    setIsEnhancing(true);
    setEnhancementError(null);

    try {
      const enhancedFile = await ImageEnhancer.enhanceImage(file, options);
      return enhancedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image enhancement failed';
      setEnhancementError(errorMessage);
      console.error('Image enhancement error:', error);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  const quickEnhance = async (file: File): Promise<File | null> => {
    return enhanceImage(file);
  };

  const analyzeAndEnhance = async (file: File): Promise<File | null> => {
    setIsEnhancing(true);
    setEnhancementError(null);

    try {
      // First analyze the image
      const analysis = await ImageEnhancer.analyzeImageQuality(file);
      
      // Then enhance with recommended settings
      const enhancedFile = await ImageEnhancer.enhanceImage(file, analysis.recommendedSettings);
      return enhancedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image analysis and enhancement failed';
      setEnhancementError(errorMessage);
      console.error('Image analysis/enhancement error:', error);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  const clearError = () => setEnhancementError(null);

  return {
    isEnhancing,
    enhancementError,
    enhanceImage,
    quickEnhance,
    analyzeAndEnhance,
    clearError
  };
}
