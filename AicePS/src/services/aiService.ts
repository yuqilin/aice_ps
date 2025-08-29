import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageAsset, FilterSuggestion } from '../types';

const EMERGENT_LLM_KEY = 'sk-emergent-b86A1C06a4aEb241fA';
// Note: This is a placeholder implementation for the Emergent API
// The actual API integration would require the proper Emergent endpoints

class AiService {
  private apiKey: string = EMERGENT_LLM_KEY;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    try {
      const storedKey = await AsyncStorage.getItem('emergent_llm_key');
      if (storedKey) {
        this.apiKey = storedKey;
      }
    } catch (error) {
      console.warn('Could not load stored API key:', error);
    }
  }

  private async makeApiRequest(prompt: string, imageData?: string, model: string = 'gemini-2.5-flash') {
    // Note: This is a placeholder implementation
    // In a real implementation, this would use the Emergent integrations library
    // For now, we'll simulate the API response for testing purposes
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    // Return a placeholder base64 image for testing
    const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    return {
      choices: [{
        message: {
          content: placeholderImage
        }
      }]
    };
  }

  // Convert image URI to base64 for API
  private async imageUriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  // Generate image from text
  async generateImageFromText(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    try {
      const fullPrompt = `Generate a high-quality image with aspect ratio ${aspectRatio}: ${prompt}`;
      const response = await this.makeApiRequest(fullPrompt, undefined, 'gemini-2.5-pro');
      
      // Note: This is a placeholder implementation
      // The actual Emergent API might return image URLs differently
      // We'll need to adapt this based on the actual API response format
      
      if (response.choices && response.choices[0]?.message?.content) {
        // If the API returns a base64 image
        return response.choices[0].message.content;
      }
      
      throw new Error('No image generated from API response');
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error(`图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Apply filter to image
  async applyFilter(imageUri: string, filterPrompt: string): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = `Apply this filter to the image: ${filterPrompt}. Return only the edited image.`;
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      // Process response and return edited image URI
      // This is a placeholder - actual implementation depends on Emergent API response format
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No edited image returned from API');
    } catch (error) {
      console.error('Filter application failed:', error);
      throw new Error(`滤镜应用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Apply adjustment to image
  async applyAdjustment(imageUri: string, adjustmentPrompt: string): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = `Apply this adjustment to the image: ${adjustmentPrompt}. Return only the edited image.`;
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No adjusted image returned from API');
    } catch (error) {
      console.error('Adjustment application failed:', error);
      throw new Error(`图像调整失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Apply texture to image
  async applyTexture(imageUri: string, texturePrompt: string): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = `Apply this texture to the image: ${texturePrompt}. Return only the edited image.`;
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No textured image returned from API');
    } catch (error) {
      console.error('Texture application failed:', error);
      throw new Error(`纹理应用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Remove background from image
  async removeBackground(imageUri: string): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = 'Remove the background from this image, leaving only the main subject with a transparent background. Return the edited image.';
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No background-removed image returned from API');
    } catch (error) {
      console.error('Background removal failed:', error);
      throw new Error(`背景移除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Apply retouch to specific hotspot
  async applyRetouch(imageUri: string, prompt: string, hotspot: { x: number, y: number }): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const retouchPrompt = `Apply this edit at coordinates (${hotspot.x}, ${hotspot.y}): ${prompt}. Return only the edited image.`;
      
      const response = await this.makeApiRequest(retouchPrompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No retouched image returned from API');
    } catch (error) {
      console.error('Retouch failed:', error);
      throw new Error(`图像修饰失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Fuse multiple images
  async fuseImages(mainImageUri: string, sourceImages: ImageAsset[], fusionPrompt: string): Promise<string> {
    try {
      const mainImageData = await this.imageUriToBase64(mainImageUri);
      const sourceImageData = await Promise.all(
        sourceImages.map(img => this.imageUriToBase64(img.uri))
      );

      const prompt = `Fuse these images together. Main image is the base. Additional images are provided for fusion. Instructions: ${fusionPrompt}. Return only the fused image.`;
      
      // For multi-image requests, we'll need to adapt this based on Emergent API capabilities
      const response = await this.makeApiRequest(prompt, mainImageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No fused image returned from API');
    } catch (error) {
      console.error('Image fusion failed:', error);
      throw new Error(`图像合成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Generate creative suggestions for filters, adjustments, or textures
  async getCreativeSuggestions(imageUri: string, type: 'filter' | 'adjustment' | 'texture'): Promise<FilterSuggestion[]> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = `Analyze this image and suggest 4 creative ${type}s that would look good on it. Provide a short Chinese name (2-4 words) and detailed English prompt for each. Format as JSON: {"suggestions": [{"name": "中文名称", "prompt": "detailed english prompt"}]}`;
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        try {
          const result = JSON.parse(response.choices[0].message.content);
          return result.suggestions || [];
        } catch (parseError) {
          console.error('Failed to parse suggestions JSON:', parseError);
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Getting creative suggestions failed:', error);
      throw new Error(`获取创意建议失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // Generate decade-style image for Past Forward feature
  async generateDecadeImage(imageUri: string, decade: string): Promise<string> {
    try {
      const imageData = await this.imageUriToBase64(imageUri);
      const prompt = `Transform this image to look like it was taken in the ${decade}. Apply the fashion, hairstyles, photography style, and atmosphere typical of that era. Return only the transformed image.`;
      
      const response = await this.makeApiRequest(prompt, imageData, 'gemini-2.5-flash');
      
      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No decade-styled image returned from API');
    } catch (error) {
      console.error('Decade image generation failed:', error);
      throw new Error(`年代风格生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export const aiService = new AiService();
export default aiService;