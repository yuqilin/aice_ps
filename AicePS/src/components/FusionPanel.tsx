import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageAsset } from '../types';

interface FusionPanelProps {
  onApplyFusion: (sourceImages: ImageAsset[], prompt: string) => void;
  isLoading: boolean;
}

const FusionPanel: React.FC<FusionPanelProps> = ({
  onApplyFusion,
  isLoading,
}) => {
  const [sourceImages, setSourceImages] = useState<ImageAsset[]>([]);
  const [fusionPrompt, setFusionPrompt] = useState('');

  const presetFusionPrompts = [
    '将源图像中的主体合成到主图像中',
    '将源图像的背景替换到主图像中',
    '将源图像的风格应用到主图像中',
    '将源图像的光照效果合成到主图像中',
    '将源图像中的物体添加到主图像的前景',
    '将源图像的色调和氛围融入主图像',
  ];

  const handleAddSourceImage = async () => {
    if (sourceImages.length >= 3) {
      Alert.alert('限制', '最多只能添加 3 张源图像');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newImage: ImageAsset = {
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type,
          name: asset.fileName || 'fusion.jpg',
        };
        setSourceImages([...sourceImages, newImage]);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片时发生错误');
      console.error('Image picker error:', error);
    }
  };

  const handleRemoveSourceImage = (index: number) => {
    const updatedImages = sourceImages.filter((_, i) => i !== index);
    setSourceImages(updatedImages);
  };

  const handleApplyFusion = () => {
    if (sourceImages.length === 0) {
      Alert.alert('提示', '请至少添加一张源图像');
      return;
    }
    if (!fusionPrompt.trim()) {
      Alert.alert('提示', '请输入合成指令');
      return;
    }
    onApplyFusion(sourceImages, fusionPrompt);
    setFusionPrompt('');
    setSourceImages([]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="git-merge" size={24} color="#8B5CF6" />
          <Text style={styles.title}>图像合成</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>合成步骤</Text>
          <Text style={styles.instructionText}>1. 添加 1-3 张源图像用于合成</Text>
          <Text style={styles.instructionText}>2. 输入详细的合成指令</Text>
          <Text style={styles.instructionText}>3. 点击应用合成，AI 将智能融合图像</Text>
        </View>

        {/* Source Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>源图像 ({sourceImages.length}/3)</Text>
          
          <View style={styles.imageGrid}>
            {sourceImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.sourceImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSourceImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {sourceImages.length < 3 && (
              <TouchableOpacity
                style={[styles.addImageButton, isLoading && styles.disabledButton]}
                onPress={handleAddSourceImage}
                disabled={isLoading}
              >
                <Ionicons name="add" size={32} color="#6B7280" />
                <Text style={styles.addImageText}>添加图像</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Fusion Prompt Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>合成指令</Text>
          <TextInput
            style={styles.textInput}
            value={fusionPrompt}
            onChangeText={setFusionPrompt}
            placeholder="详细描述如何合成这些图像，例如：'将第一张图中的人物合成到主图的右侧，保持光照一致'"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />
        </View>

        {/* Preset Prompts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预设指令</Text>
          <View style={styles.promptGrid}>
            {presetFusionPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.promptButton, isLoading && styles.disabledButton]}
                onPress={() => setFusionPrompt(prompt)}
                disabled={isLoading}
              >
                <Text style={styles.promptButtonText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            (sourceImages.length === 0 || !fusionPrompt.trim() || isLoading) && styles.disabledButton
          ]}
          onPress={handleApplyFusion}
          disabled={sourceImages.length === 0 || !fusionPrompt.trim() || isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#6B46C1', '#6B46C1'] : ['#8B5CF6', '#7C3AED']}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.buttonText}>合成中...</Text>
              </>
            ) : (
              <>
                <Ionicons name="git-merge" size={18} color="white" />
                <Text style={styles.buttonText}>应用合成</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  instructionContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    color: '#DDD6FE',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  sourceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6B7280',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  promptGrid: {
    gap: 8,
  },
  promptButton: {
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  promptButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default FusionPanel;