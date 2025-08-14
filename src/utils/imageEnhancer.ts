/**
 * Image Enhancement Utility
 * Provides client-side image sharpening, contrast enhancement, and optimization
 */

export interface ImageEnhancementOptions {
  sharpen?: boolean;
  sharpenIntensity?: number; // 0-1
  contrast?: number; // 0-2 (1 is normal)
  brightness?: number; // 0-2 (1 is normal)
  saturation?: number; // 0-2 (1 is normal)
  quality?: number; // 0-1 for JPEG compression
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageEnhancer {
  /**
   * Enhance an image file with various filters and optimizations
   */
  static async enhanceImage(
    file: File, 
    options: ImageEnhancementOptions = {}
  ): Promise<File> {
    const {
      sharpen = true,
      sharpenIntensity = 0.3,
      contrast = 1.1,
      brightness = 1.0,
      saturation = 1.05,
      quality = 0.9,
      maxWidth = 1920,
      maxHeight = 1080
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          );

          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and resize image
          ctx.drawImage(img, 0, 0, width, height);

          // Apply enhancements
          if (contrast !== 1 || brightness !== 1 || saturation !== 1) {
            this.applyColorAdjustments(ctx, width, height, contrast, brightness, saturation);
          }

          if (sharpen) {
            this.applySharpenFilter(ctx, width, height, sharpenIntensity);
          }

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const enhancedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(enhancedFile);
            } else {
              reject(new Error('Failed to create enhanced image blob'));
            }
          }, file.type, quality);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too large
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Apply color adjustments (contrast, brightness, saturation)
   */
  private static applyColorAdjustments(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    contrast: number,
    brightness: number,
    saturation: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      r *= brightness;
      g *= brightness;
      b *= brightness;

      // Apply contrast
      r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
      b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

      // Apply saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + saturation * (r - gray);
      g = gray + saturation * (g - gray);
      b = gray + saturation * (b - gray);

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply smart sharpening filter with advanced text preservation
   */
  private static applySharpenFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const originalData = new Uint8ClampedArray(data);

    // Advanced text detection using multiple techniques
    const textMap = this.detectTextAreas(originalData, width, height);
    const edgeMap = this.detectEdges(originalData, width, height);

    // Apply unsharp mask with intelligent text protection
    this.applyUnsharpMask(ctx, originalData, width, height, intensity, textMap, edgeMap);
  }

  /**
   * Apply unsharp mask sharpening with text-aware intensity control
   */
  private static applyUnsharpMask(
    ctx: CanvasRenderingContext2D,
    originalData: Uint8ClampedArray,
    width: number,
    height: number,
    intensity: number,
    textMap: Float32Array,
    edgeMap: Float32Array
  ): void {
    // Create blurred version for unsharp mask
    const blurredData = this.createGaussianBlur(originalData, width, height, 1.0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = Math.floor(i / 4);
      const textProbability = textMap[pixelIndex];
      const edgeStrength = edgeMap[pixelIndex];

      // Smart intensity adjustment based on content analysis
      let adaptiveIntensity = intensity;
      
      // Reduce sharpening in text areas to prevent aliasing
      if (textProbability > 0.4) {
        adaptiveIntensity *= 0.2; // Much gentler on text
      } else if (textProbability > 0.2) {
        adaptiveIntensity *= 0.5; // Moderate reduction near text
      } else if (edgeStrength > 0.4) {
        adaptiveIntensity *= 0.6; // Gentle on high-contrast edges
      }

      // Apply unsharp mask formula: original + intensity * (original - blurred)
      for (let c = 0; c < 3; c++) { // RGB channels only
        const original = originalData[i + c];
        const blurred = blurredData[i + c];
        const difference = original - blurred;
        
        // Apply sharpening with adaptive intensity
        const enhanced = original + adaptiveIntensity * difference;
        
        data[i + c] = Math.max(0, Math.min(255, enhanced));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Create Gaussian blur for unsharp mask
   */
  private static createGaussianBlur(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number
  ): Uint8ClampedArray {
    const blurred = new Uint8ClampedArray(data.length);
    const kernel = this.generateGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    // Apply separable Gaussian blur (horizontal then vertical)
    const temp = new Uint8ClampedArray(data.length);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const sampleX = x + k - halfKernel;
            if (sampleX >= 0 && sampleX < width) {
              const sampleIndex = (y * width + sampleX) * 4 + c;
              sum += data[sampleIndex] * kernel[k];
              weightSum += kernel[k];
            }
          }
          
          temp[pixelIndex + c] = sum / weightSum;
        }
      }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const sampleY = y + k - halfKernel;
            if (sampleY >= 0 && sampleY < height) {
              const sampleIndex = (sampleY * width + x) * 4 + c;
              sum += temp[sampleIndex] * kernel[k];
              weightSum += kernel[k];
            }
          }
          
          blurred[pixelIndex + c] = sum / weightSum;
        }
      }
    }

    return blurred;
  }

  /**
   * Generate Gaussian kernel for blur
   */
  private static generateGaussianKernel(radius: number): number[] {
    const size = Math.ceil(radius * 2) * 2 + 1;
    const kernel = new Array(size);
    const sigma = radius / 3;
    let sum = 0;

    const center = Math.floor(size / 2);
    for (let i = 0; i < size; i++) {
      const x = i - center;
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
      sum += kernel[i];
    }

    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
  }

  /**
   * Advanced text area detection using multiple heuristics
   */
  private static detectTextAreas(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): Float32Array {
    const textMap = new Float32Array(width * height);
    
    // Analyze local patterns that indicate text
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const pixelIndex = y * width + x;
        let textProbability = 0;

        // Check for high-contrast patterns typical of text
        const contrast = this.calculateLocalContrast(data, x, y, width, height);
        if (contrast > 50) {
          textProbability += 0.3;
        }

        // Check for regular patterns (text has regular spacing)
        const regularity = this.calculatePatternRegularity(data, x, y, width, height);
        textProbability += regularity * 0.4;

        // Check for sharp edges with specific orientations (text edges)
        const edgeOrientation = this.calculateEdgeOrientation(data, x, y, width, height);
        if (edgeOrientation > 0.7) {
          textProbability += 0.3;
        }

        textMap[pixelIndex] = Math.min(1.0, textProbability);
      }
    }

    return textMap;
  }

  /**
   * Calculate local contrast around a pixel
   */
  private static calculateLocalContrast(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    const centerIndex = (y * width + x) * 4;
    const centerGray = 0.299 * data[centerIndex] + 0.587 * data[centerIndex + 1] + 0.114 * data[centerIndex + 2];
    
    let minGray = centerGray;
    let maxGray = centerGray;

    // Check 3x3 neighborhood
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = (ny * width + nx) * 4;
          const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
          minGray = Math.min(minGray, gray);
          maxGray = Math.max(maxGray, gray);
        }
      }
    }

    return maxGray - minGray;
  }

  /**
   * Calculate pattern regularity (text has more regular patterns)
   */
  private static calculatePatternRegularity(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    // Simple regularity check: look for repeating patterns in horizontal direction
    let regularity = 0;
    const windowSize = 5;
    
    if (x >= windowSize && x < width - windowSize) {
      for (let offset = 1; offset <= 3; offset++) {
        const leftIndex = (y * width + (x - offset)) * 4;
        const rightIndex = (y * width + (x + offset)) * 4;
        
        const leftGray = 0.299 * data[leftIndex] + 0.587 * data[leftIndex + 1] + 0.114 * data[leftIndex + 2];
        const rightGray = 0.299 * data[rightIndex] + 0.587 * data[rightIndex + 1] + 0.114 * data[rightIndex + 2];
        
        const similarity = 1 - Math.abs(leftGray - rightGray) / 255;
        regularity += similarity;
      }
    }
    
    return regularity / 3;
  }

  /**
   * Calculate edge orientation strength (text has strong vertical/horizontal edges)
   */
  private static calculateEdgeOrientation(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    _height: number
  ): number {
    if (x < 1 || x >= width - 1 || y < 1 || y >= _height - 1) return 0;

    // Calculate gradients
    const leftIndex = (y * width + (x - 1)) * 4;
    const rightIndex = (y * width + (x + 1)) * 4;
    const topIndex = ((y - 1) * width + x) * 4;
    const bottomIndex = ((y + 1) * width + x) * 4;

    const leftGray = 0.299 * data[leftIndex] + 0.587 * data[leftIndex + 1] + 0.114 * data[leftIndex + 2];
    const rightGray = 0.299 * data[rightIndex] + 0.587 * data[rightIndex + 1] + 0.114 * data[rightIndex + 2];
    const topGray = 0.299 * data[topIndex] + 0.587 * data[topIndex + 1] + 0.114 * data[topIndex + 2];
    const bottomGray = 0.299 * data[bottomIndex] + 0.587 * data[bottomIndex + 1] + 0.114 * data[bottomIndex + 2];

    const horizontalGradient = Math.abs(rightGray - leftGray);
    const verticalGradient = Math.abs(bottomGray - topGray);
    
    // Text typically has strong gradients in one direction
    const maxGradient = Math.max(horizontalGradient, verticalGradient);
    const minGradient = Math.min(horizontalGradient, verticalGradient);
    
    // Return orientation strength (high when one direction dominates)
    return maxGradient > 30 ? (maxGradient - minGradient) / maxGradient : 0;
  }

  /**
   * Detect edges in the image to identify text and fine details
   */
  private static detectEdges(data: Uint8ClampedArray, width: number, height: number): Float32Array {
    const edgeMap = new Float32Array(width * height);
    
    // Sobel edge detection
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = ((y + ky) * width + (x + kx)) * 4;
            const gray = 0.299 * data[pixel] + 0.587 * data[pixel + 1] + 0.114 * data[pixel + 2];
            
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy) / 255;
        edgeMap[y * width + x] = magnitude;
      }
    }
    
    return edgeMap;
  }

  /**
   * Quick enhance with preset settings optimized for carousel images with text
   */
  static async quickEnhanceForCarousel(file: File): Promise<File> {
    return this.enhanceImage(file, {
      sharpen: true,
      sharpenIntensity: 0.25, // Reduced from 0.4 for better text preservation
      contrast: 1.08, // Reduced from 1.15 for gentler enhancement
      brightness: 1.02, // Reduced from 1.05 for subtle adjustment
      saturation: 1.05, // Reduced from 1.1 for natural colors
      quality: 0.92,
      maxWidth: 1920,
      maxHeight: 1080
    });
  }

  /**
   * Check if image needs enhancement based on quality metrics
   */
  static async analyzeImageQuality(file: File): Promise<{
    needsSharpening: boolean;
    needsContrast: boolean;
    needsBrightness: boolean;
    recommendedSettings: ImageEnhancementOptions;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({
            needsSharpening: true,
            needsContrast: true,
            needsBrightness: false,
            recommendedSettings: {}
          });
          return;
        }

        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate image statistics
        let brightness = 0;
        let contrast = 0;
        let sharpness = 0;

        // Analyze brightness
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          brightness += gray;
        }
        brightness /= (data.length / 4);

        // Analyze contrast (standard deviation)
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          variance += Math.pow(gray - brightness, 2);
        }
        contrast = Math.sqrt(variance / (data.length / 4));

        // Analyze sharpness (gradient magnitude)
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const i = (y * canvas.width + x) * 4;
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            const rightGray = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
            const bottomGray = 0.299 * data[i + canvas.width * 4] + 0.587 * data[i + canvas.width * 4 + 1] + 0.114 * data[i + canvas.width * 4 + 2];
            
            const gradX = rightGray - gray;
            const gradY = bottomGray - gray;
            sharpness += Math.sqrt(gradX * gradX + gradY * gradY);
          }
        }
        sharpness /= ((canvas.width - 2) * (canvas.height - 2));

        // Determine needs and recommendations
        const needsSharpening = sharpness < 15;
        const needsContrast = contrast < 30;
        const needsBrightness = brightness < 100 || brightness > 180;

        const recommendedSettings: ImageEnhancementOptions = {
          sharpen: needsSharpening,
          sharpenIntensity: needsSharpening ? 0.5 : 0.2,
          contrast: needsContrast ? 1.2 : 1.05,
          brightness: brightness < 100 ? 1.15 : brightness > 180 ? 0.9 : 1.0,
          saturation: 1.1
        };

        resolve({
          needsSharpening,
          needsContrast,
          needsBrightness,
          recommendedSettings
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
