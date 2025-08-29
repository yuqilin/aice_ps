import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ImageAsset, FilterSuggestion } from '../types';
import { aiService } from '../services/aiService';

interface TexturePanelProps {
  currentImage: ImageAsset;
  onApplyTexture: (prompt: string) => void;
  isLoading: boolean;
}

const TexturePanel: React.FC<TexturePanelProps> = ({
  currentImage,
  onApplyTexture,
  isLoading,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const presetTextures = [
    { name: '木纹纹理', prompt: 'wood texture overlay, natural wood grain pattern' },
    { name: '金属拉丝', prompt: 'brushed metal texture, metallic surface effect' },
    { name: '裂纹效果', prompt: 'cracked texture overlay, aged cracking pattern' },
    { name: '水彩纸质', prompt: 'watercolor paper texture, artistic paper grain' },
    { name: '皮革质感', prompt: 'leather texture overlay, natural leather pattern' },
    { name: '石头纹理', prompt: 'stone texture effect, rocky surface pattern' },
    { name: '布料质感', prompt: 'fabric texture overlay, cloth weave pattern' },
    { name: '玻璃效果', prompt: 'glass texture effect, transparent glass surface' },
  ];

  useEffect(() => {
    loadSuggestions();
  }, [currentImage]);

  const loadSuggestions = async () => {
    if (!currentImage) return;
    
    setLoadingSuggestions(true);
    try {
      const aiSuggestions = await aiService.getCreativeSuggestions(currentImage.uri, 'texture');
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to load texture suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplyTexture = (prompt: string) => {
    if (!prompt.trim()) {
      Alert.alert('提示', '请输入或选择一个纹理效果');
      return;
    }
    onApplyTexture(prompt);
    setCustomPrompt('');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="layers" size={24} color="#10B981" />
          <Text style={styles.title}>纹理叠加</Text>
        </View>

        {/* Custom Texture Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自定义纹理</Text>
          <TextInput
            style={styles.textInput}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="描述你想要的纹理效果，例如：'复古羊皮纸纹理，古老质感'"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={2}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.applyButton, (!customPrompt.trim() || isLoading) && styles.disabledButton]}
            onPress={() => handleApplyTexture(customPrompt)}
            disabled={!customPrompt.trim() || isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#047857', '#047857'] : ['#10B981', '#047857']}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>处理中...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={styles.buttonText}>应用纹理</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Preset Textures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预设纹理</Text>
          <View style={styles.textureGrid}>
            {presetTextures.map((texture, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.textureButton, isLoading && styles.disabledButton]}
                onPress={() => handleApplyTexture(texture.prompt)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.2)', 'rgba(4, 120, 87, 0.2)']}
                  style={styles.textureGradient}
                >
                  <Text style={styles.textureButtonText}>{texture.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Suggestions */}
        <View style={styles.section}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.sectionTitle}>AI 推荐</Text>
            <TouchableOpacity
              onPress={loadSuggestions}
              disabled={loadingSuggestions}
              style={styles.refreshButton}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={loadingSuggestions ? "#6B7280" : "#10B981"} 
              />
            </TouchableOpacity>
          </View>
          
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingText}>AI 正在分析图片...</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <View style={styles.suggestionGrid}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, isLoading && styles.disabledButton]}
                  onPress={() => handleApplyTexture(suggestion.prompt)}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                    style={styles.textureGradient}
                  >
                    <Text style={styles.suggestionButtonText}>{suggestion.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSuggestionsText}>暂无推荐，请稍后再试</Text>
          )}
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    marginBottom: 12,
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  textureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  textureButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  textureGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 12,
  },
  textureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 12,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  suggestionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noSuggestionsText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default TexturePanel;