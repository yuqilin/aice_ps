import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AspectRatio } from '../types';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspectRatio: (ratio: number | null) => void;
  isLoading: boolean;
  isCropping: boolean;
}

const CropPanel: React.FC<CropPanelProps> = ({
  onApplyCrop,
  onSetAspectRatio,
  isLoading,
  isCropping,
}) => {
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);

  const aspectRatios: AspectRatio[] = [
    { name: '自由裁剪', value: null },
    { name: '方形 1:1', value: 1 },
    { name: '横向 16:9', value: 16/9 },
    { name: '纵向 9:16', value: 9/16 },
    { name: '风景 4:3', value: 4/3 },
    { name: '肖像 3:4', value: 3/4 },
    { name: '社交媒体 5:4', value: 5/4 },
    { name: '黄金比例', value: 1.618 },
  ];

  const handleAspectRatioSelect = (ratio: number | null) => {
    setSelectedRatio(ratio);
    onSetAspectRatio(ratio);
  };

  const handleApplyCrop = () => {
    if (!isCropping) {
      Alert.alert('提示', '请先选择要裁剪的区域');
      return;
    }
    onApplyCrop();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="crop" size={24} color="#EF4444" />
          <Text style={styles.title}>图像裁剪</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            1. 选择宽高比约束或选择自由裁剪
          </Text>
          <Text style={styles.instructionText}>
            2. 在图像上拖拽选择裁剪区域
          </Text>
          <Text style={styles.instructionText}>
            3. 点击应用裁剪完成操作
          </Text>
        </View>

        {/* Aspect Ratio Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>宽高比</Text>
          <View style={styles.ratioGrid}>
            {aspectRatios.map((ratio, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.ratioButton,
                  selectedRatio === ratio.value && styles.ratioButtonSelected,
                  isLoading && styles.disabledButton
                ]}
                onPress={() => handleAspectRatioSelect(ratio.value)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.ratioButtonText,
                    selectedRatio === ratio.value && styles.ratioButtonTextSelected
                  ]}
                >
                  {ratio.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crop Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.cropButton,
              (!isCropping || isLoading) && styles.disabledButton
            ]}
            onPress={handleApplyCrop}
            disabled={!isCropping || isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#DC2626', '#DC2626'] : ['#EF4444', '#DC2626']}
              style={styles.gradientButton}
            >
              <Ionicons name="cut" size={20} color="white" />
              <Text style={styles.buttonText}>
                {isCropping ? '应用裁剪' : '请选择裁剪区域'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Crop Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>裁剪技巧</Text>
          <View style={styles.tipContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color="#60A5FA" />
              <Text style={styles.tipText}>使用三分法则，将主体放在网格线交点</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color="#60A5FA" />
              <Text style={styles.tipText}>保留足够的背景空间，避免过度裁剪</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color="#60A5FA" />
              <Text style={styles.tipText}>考虑最终用途选择合适的宽高比</Text>
            </View>
          </View>
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
  instructionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  instructionText: {
    color: '#DBEAFE',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
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
  ratioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratioButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    marginBottom: 8,
  },
  ratioButtonSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  ratioButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  ratioButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cropButton: {
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
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default CropPanel;