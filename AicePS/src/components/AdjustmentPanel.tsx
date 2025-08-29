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

interface AdjustmentPanelProps {
  currentImage: ImageAsset;
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  currentImage,
  onApplyAdjustment,
  isLoading,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const presetAdjustments = [
    { name: '提升亮度', prompt: 'increase brightness, enhance illumination' },
    { name: '增强对比', prompt: 'increase contrast, enhance image depth' },
    { name: '背景虚化', prompt: 'blur background, focus on main subject' },
    { name: '锐化细节', prompt: 'sharpen details, enhance image clarity' },
    { name: '暖色调', prompt: 'warm color tone, cozy atmosphere' },
    { name: '冷色调', prompt: 'cool color tone, fresh atmosphere' },
    { name: '增强饱和', prompt: 'increase saturation, vibrant colors' },
    { name: '柔和光效', prompt: 'soft lighting, gentle illumination' },
  ];

  useEffect(() => {
    loadSuggestions();
  }, [currentImage]);

  const loadSuggestions = async () => {
    if (!currentImage) return;
    
    setLoadingSuggestions(true);
    try {
      const aiSuggestions = await aiService.getCreativeSuggestions(currentImage.uri, 'adjustment');
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to load adjustment suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplyAdjustment = (prompt: string) => {
    if (!prompt.trim()) {
      Alert.alert('提示', '请输入或选择一个调整效果');
      return;
    }
    onApplyAdjustment(prompt);
    setCustomPrompt('');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="tune" size={24} color="#F59E0B" />
          <Text style={styles.title}>图像调整</Text>
        </View>

        {/* Custom Adjustment Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自定义调整</Text>
          <TextInput
            style={styles.textInput}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="描述你想要的调整效果，例如：'提升亮度，增强细节'"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={2}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.applyButton, (!customPrompt.trim() || isLoading) && styles.disabledButton]}
            onPress={() => handleApplyAdjustment(customPrompt)}
            disabled={!customPrompt.trim() || isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#D97706', '#D97706'] : ['#F59E0B', '#D97706']}
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
                  <Text style={styles.buttonText}>应用调整</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Preset Adjustments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预设调整</Text>
          <View style={styles.adjustmentGrid}>
            {presetAdjustments.map((adjustment, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.adjustmentButton, isLoading && styles.disabledButton]}
                onPress={() => handleApplyAdjustment(adjustment.prompt)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)']}
                  style={styles.adjustmentGradient}
                >
                  <Text style={styles.adjustmentButtonText}>{adjustment.name}</Text>
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
                color={loadingSuggestions ? "#6B7280" : "#F59E0B"} 
              />
            </TouchableOpacity>
          </View>
          
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>AI 正在分析图片...</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <View style={styles.suggestionGrid}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, isLoading && styles.disabledButton]}
                  onPress={() => handleApplyAdjustment(suggestion.prompt)}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)']}
                    style={styles.adjustmentGradient}
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
  adjustmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  adjustmentButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  adjustmentGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 12,
  },
  adjustmentButtonText: {
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

export default AdjustmentPanel;