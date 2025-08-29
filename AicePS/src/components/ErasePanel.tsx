import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ErasePanelProps {
  onRemoveBackground: () => void;
  isLoading: boolean;
}

const ErasePanel: React.FC<ErasePanelProps> = ({
  onRemoveBackground,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="cut" size={24} color="#F97316" />
        <Text style={styles.title}>智能抠图</Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>一键移除背景</Text>
        <Text style={styles.descriptionText}>
          使用 AI 智能识别主体，自动移除背景，生成透明背景的图像。
          适用于人物、物品、动物等各种主体的精确抠图。
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能特点</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>AI 智能识别主体边缘</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>精确处理细节如头发、毛发</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>生成透明背景 PNG 格式</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>保持原图质量和细节</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.eraseButton, isLoading && styles.disabledButton]}
          onPress={onRemoveBackground}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#EA580C', '#EA580C'] : ['#F97316', '#EA580C']}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.buttonText}>AI 正在处理中...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cut" size={20} color="white" />
                <Text style={styles.buttonText}>开始抠图</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用提示</Text>
        <View style={styles.tipContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color="#FBBF24" />
            <Text style={styles.tipText}>主体与背景对比度越高，抠图效果越好</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color="#FBBF24" />
            <Text style={styles.tipText}>避免主体与背景颜色过于相似</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color="#FBBF24" />
            <Text style={styles.tipText}>清晰的图像边缘能获得更精确的结果</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#D1D5DB',
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
  featureList: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    marginVertical: 24,
  },
  eraseButton: {
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

export default ErasePanel;