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

interface FilterPanelProps {
  currentImage: ImageAsset;
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  currentImage,
  onApplyFilter,
  isLoading,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const presetFilters = [
    { name: '动漫风格', prompt: 'anime style, vibrant colors, manga-inspired' },
    { name: '油画效果', prompt: 'oil painting style, artistic brushstrokes, classical art' },
    { name: '赛博朋克', prompt: 'cyberpunk style, neon lights, futuristic, digital art' },
    { name: '水彩画', prompt: 'watercolor painting style, soft colors, artistic' },
    { name: '黑白经典', prompt: 'black and white, classic monochrome, artistic contrast' },
    { name: '复古胶片', prompt: 'vintage film look, retro colors, nostalgic atmosphere' },
    { name: '梦幻光效', prompt: 'dreamy light effects, soft glow, magical atmosphere' },
    { name: '素描风格', prompt: 'pencil sketch style, artistic drawing, detailed lines' },
  ];

  useEffect(() => {
    loadSuggestions();
  }, [currentImage]);

  const loadSuggestions = async () => {
    if (!currentImage) return;
    
    setLoadingSuggestions(true);
    try {
      const aiSuggestions = await aiService.getCreativeSuggestions(currentImage.uri, 'filter');
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to load filter suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplyFilter = (prompt: string) => {
    if (!prompt.trim()) {
      Alert.alert('提示', '请输入或选择一个滤镜效果');
      return;
    }
    onApplyFilter(prompt);
    setCustomPrompt('');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="color-filter" size={24} color="#8B5CF6" />
          <Text style={styles.title}>创意滤镜</Text>
        </View>

        {/* Custom Filter Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自定义滤镜</Text>
          <TextInput
            style={styles.textInput}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="描述你想要的滤镜效果，例如：'复古胶片风格，温暖色调'"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={2}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.applyButton, (!customPrompt.trim() || isLoading) && styles.disabledButton]}
            onPress={() => handleApplyFilter(customPrompt)}
            disabled={!customPrompt.trim() || isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#6B46C1', '#6B46C1'] : ['#8B5CF6', '#7C3AED']}
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
                  <Text style={styles.buttonText}>应用滤镜</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Preset Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预设滤镜</Text>
          <View style={styles.filterGrid}>
            {presetFilters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.filterButton, isLoading && styles.disabledButton]}
                onPress={() => handleApplyFilter(filter.prompt)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
                  style={styles.filterGradient}
                >
                  <Text style={styles.filterButtonText}>{filter.name}</Text>
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
                color={loadingSuggestions ? "#6B7280" : "#8B5CF6"} 
              />
            </TouchableOpacity>
          </View>
          
          {loadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.loadingText}>AI 正在分析图片...</Text>
            </View>
          ) : suggestions.length > 0 ? (
            <View style={styles.suggestionGrid}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, isLoading && styles.disabledButton]}
                  onPress={() => handleApplyFilter(suggestion.prompt)}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                    style={styles.filterGradient}
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
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  filterGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    borderRadius: 12,
  },
  filterButtonText: {
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

export default FilterPanel;