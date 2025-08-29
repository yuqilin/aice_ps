import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import { ImageAsset } from '../types';
import { aiService } from '../services/aiService';

const { width: screenWidth } = Dimensions.get('window');

interface PastForwardScreenProps {
  onBack: () => void;
}

interface DecadeResult {
  decade: string;
  uri: string;
}

const PastForwardScreen: React.FC<PastForwardScreenProps> = ({ onBack }) => {
  const [originalImage, setOriginalImage] = useState<ImageAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DecadeResult[]>([]);
  const [currentDecade, setCurrentDecade] = useState<string | null>(null);

  const decades = [
    { name: '1920年代', value: '1920s', description: '咆哮的二十年代' },
    { name: '1930年代', value: '1930s', description: '大萧条时代' },
    { name: '1940年代', value: '1940s', description: '战争与重建' },
    { name: '1950年代', value: '1950s', description: '黄金五十年代' },
    { name: '1960年代', value: '1960s', description: '摇摆的六十年代' },
    { name: '1970年代', value: '1970s', description: '迪斯科时代' },
    { name: '1980年代', value: '1980s', description: '新浪潮时代' },
    { name: '1990年代', value: '1990s', description: '数字革命前夜' },
  ];

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setOriginalImage({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type,
          name: asset.fileName,
        });
        setResults([]);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片时发生错误');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限需求', '需要相机权限才能拍照');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setOriginalImage({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type,
          name: asset.fileName,
        });
        setResults([]);
      }
    } catch (error) {
      Alert.alert('错误', '拍照时发生错误');
      console.error('Camera error:', error);
    }
  };

  const generateDecadeImage = async (decade: string) => {
    if (!originalImage) return;

    setIsProcessing(true);
    setCurrentDecade(decade);

    try {
      const resultUri = await aiService.generateDecadeImage(originalImage.uri, decade);
      
      const newResult: DecadeResult = {
        decade,
        uri: resultUri,
      };

      setResults(prev => {
        const filtered = prev.filter(r => r.decade !== decade);
        return [...filtered, newResult];
      });
    } catch (error) {
      Alert.alert('生成失败', error instanceof Error ? error.message : '生成年代风格图像时发生未知错误');
      console.error(`Decade ${decade} generation error:`, error);
    } finally {
      setIsProcessing(false);
      setCurrentDecade(null);
    }
  };

  const generateAllDecades = async () => {
    if (!originalImage) return;

    for (const decade of decades) {
      await generateDecadeImage(decade.value);
    }
  };

  const saveImage = async (uri: string, decade: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限需求', '需要媒体库权限才能保存图片');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      Alert.alert('保存成功', `${decade}风格图片已保存到相册`);
    } catch (error) {
      Alert.alert('保存失败', '保存图片时发生错误');
      console.error('Save error:', error);
    }
  };

  const getDecadeName = (value: string) => {
    return decades.find(d => d.value === value)?.name || value;
  };

  if (!originalImage) {
    return (
      <LinearGradient colors={['#090A0F', '#1B2735', '#090A0F']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Past Forward</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Welcome Content */}
        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="time" size={64} color="#FBBF24" />
            <Text style={styles.welcomeTitle}>Past Forward</Text>
            <Text style={styles.welcomeSubtitle}>穿越时空的肖像之旅</Text>
            <Text style={styles.welcomeDescription}>
              上传一张人像照片，AI 将为您生成不同年代的风格版本，
              从 1920 年代到 1990 年代，体验时光倒流的魅力。
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSelectImage}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientButton}>
                <Ionicons name="image" size={24} color="white" />
                <Text style={styles.buttonText}>选择照片</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientButton}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>拍摄照片</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>特色功能</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={20} color="#FBBF24" />
                <Text style={styles.featureText}>8个经典年代风格</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="person" size={20} color="#FBBF24" />
                <Text style={styles.featureText}>智能人像识别</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="color-palette" size={20} color="#FBBF24" />
                <Text style={styles.featureText}>历史风格还原</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="download" size={20} color="#FBBF24" />
                <Text style={styles.featureText}>高清图片导出</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#090A0F', '#1B2735', '#090A0F']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setOriginalImage(null)} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Forward</Text>
        <TouchableOpacity onPress={handleSelectImage} style={styles.headerButton}>
          <Ionicons name="image" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Original Image */}
        <View style={styles.originalSection}>
          <Text style={styles.sectionTitle}>原始照片</Text>
          <View style={styles.originalImageContainer}>
            <Image source={{ uri: originalImage.uri }} style={styles.originalImage} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.generationActions}>
          <TouchableOpacity
            style={[styles.generateButton, isProcessing && styles.disabledButton]}
            onPress={generateAllDecades}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? ['#FBBF24', '#FBBF24'] : ['#FBBF24', '#F59E0B']}
              style={styles.gradientButton}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>生成中...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="white" />
                  <Text style={styles.buttonText}>生成所有年代</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Decades Grid */}
        <View style={styles.decadesSection}>
          <Text style={styles.sectionTitle}>选择年代风格</Text>
          <View style={styles.decadesGrid}>
            {decades.map((decade) => {
              const result = results.find(r => r.decade === decade.value);
              const isCurrentlyProcessing = currentDecade === decade.value;

              return (
                <View key={decade.value} style={styles.decadeCard}>
                  <View style={styles.decadeHeader}>
                    <Text style={styles.decadeName}>{decade.name}</Text>
                    <Text style={styles.decadeDescription}>{decade.description}</Text>
                  </View>

                  <View style={styles.decadeImageContainer}>
                    {result ? (
                      <Image source={{ uri: result.uri }} style={styles.decadeImage} />
                    ) : isCurrentlyProcessing ? (
                      <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#FBBF24" />
                        <Text style={styles.processingText}>生成中...</Text>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="image-outline" size={32} color="#6B7280" />
                        <Text style={styles.placeholderText}>未生成</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.decadeActions}>
                    {result ? (
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => saveImage(result.uri, decade.name)}
                      >
                        <Ionicons name="download" size={16} color="#10B981" />
                        <Text style={styles.saveButtonText}>保存</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.generateSingleButton, isProcessing && styles.disabledButton]}
                        onPress={() => generateDecadeImage(decade.value)}
                        disabled={isProcessing}
                      >
                        <Ionicons name="play" size={16} color="white" />
                        <Text style={styles.generateSingleText}>生成</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#FBBF24',
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionSection: {
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
  featuresSection: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 16,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  originalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  originalImageContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  originalImage: {
    width: screenWidth - 64,
    height: (screenWidth - 64) * 1.2,
    borderRadius: 12,
  },
  generationActions: {
    marginBottom: 24,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  decadesSection: {},
  decadesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  decadeCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  decadeHeader: {
    marginBottom: 12,
  },
  decadeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  decadeDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  decadeImageContainer: {
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  decadeImage: {
    width: '100%',
    height: '100%',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FBBF24',
    fontSize: 14,
    marginTop: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  decadeActions: {
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  generateSingleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  generateSingleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default PastForwardScreen;