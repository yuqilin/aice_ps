import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageAsset } from '../types';
import { aiService } from '../services/aiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StartScreenProps {
  onImageSelected: (image: ImageAsset) => void;
  onImageGenerated: (imageUri: string) => void;
  onNavigateToPastForward?: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onImageSelected, onImageGenerated, onNavigateToPastForward }) => {
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');

  const aspectRatios = [
    { name: '方形', value: '1:1' as const },
    { name: '横向', value: '16:9' as const },
    { name: '纵向', value: '9:16' as const },
    { name: '风景', value: '4:3' as const },
    { name: '肖像', value: '3:4' as const },
  ];

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限需求', '需要访问相册权限才能选择图片');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限需求', '需要相机权限才能拍照');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageSelected({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type,
          name: asset.fileName,
        });
      }
    } catch (error) {
      Alert.alert('错误', '选择图片时发生错误');
      console.error('Image picker error:', error);
    }
  };

  const handleCameraPicker = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageSelected({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type,
          name: asset.fileName,
        });
      }
    } catch (error) {
      Alert.alert('错误', '拍照时发生错误');
      console.error('Camera error:', error);
    }
  };

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) {
      Alert.alert('提示', '请输入描述内容');
      return;
    }

    setIsGenerating(true);
    try {
      const imageUri = await aiService.generateImageFromText(generationPrompt, aspectRatio);
      onImageGenerated(imageUri);
    } catch (error) {
      Alert.alert('生成失败', error instanceof Error ? error.message : '生成图像时发生未知错误');
      console.error('Image generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <LinearGradient
      colors={['#090A0F', '#1B2735', '#090A0F']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Aice PS</Text>
          <Text style={styles.subtitle}>化繁为简</Text>
          <Text style={styles.description}>最强改图模型 & 好用配套应用</Text>
          <Text style={styles.note}>从一个想法开始创作，或上传一张照片进行编辑</Text>
        </View>

        {/* AI Generation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>用 AI 创造图像</Text>
          </View>

          <TextInput
            style={styles.textInput}
            value={generationPrompt}
            onChangeText={setGenerationPrompt}
            placeholder="例如：一只戴着宇航员头盔的小狗漂浮在多彩的星云中，数字艺术"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            editable={!isGenerating}
          />

          <View style={styles.aspectRatioContainer}>
            <Text style={styles.aspectRatioLabel}>宽高比:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {aspectRatios.map(({ name, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.aspectRatioButton,
                    aspectRatio === value && styles.aspectRatioButtonActive
                  ]}
                  onPress={() => setAspectRatio(value)}
                  disabled={isGenerating}
                >
                  <Text
                    style={[
                      styles.aspectRatioButtonText,
                      aspectRatio === value && styles.aspectRatioButtonTextActive
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={isGenerating ? ['#6B46C1', '#6B46C1'] : ['#8B5CF6', '#7C3AED']}
              style={styles.gradientButton}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>正在生成中...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="brush" size={20} color="white" />
                  <Text style={styles.buttonText}>生成图片</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Image Selection Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleImagePicker}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.gradientButton}
            >
              <Ionicons name="image" size={20} color="white" />
              <Text style={styles.buttonText}>从相册选择</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCameraPicker}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.gradientButton}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.buttonText}>拍照编辑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
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
    marginBottom: 16,
  },
  aspectRatioContainer: {
    marginBottom: 20,
  },
  aspectRatioLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '500',
  },
  aspectRatioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  aspectRatioButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  aspectRatioButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  aspectRatioButtonTextActive: {
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonDisabled: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
});

export default StartScreen;