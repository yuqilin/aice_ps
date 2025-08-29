import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

import { ImageAsset, EditTab, LastAction, RetouchHotspot, EditHistory } from '../types';
import { aiService } from '../services/aiService';
import { cropImage } from '../utils/imageUtils';

import EditingCanvas from '../components/EditingCanvas';
import FilterPanel from '../components/FilterPanel';
import AdjustmentPanel from '../components/AdjustmentPanel';
import TexturePanel from '../components/TexturePanel';
import CropPanel from '../components/CropPanel';
import ErasePanel from '../components/ErasePanel';
import FusionPanel from '../components/FusionPanel';

const { width: screenWidth } = Dimensions.get('window');

interface EditorScreenProps {
  image: ImageAsset;
  onBack: () => void;
}

const EditorScreen: React.FC<EditorScreenProps> = ({ image, onBack }) => {
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('adjust');
  const [isComparing, setIsComparing] = useState(false);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  // Retouch state
  const [retouchPrompt, setRetouchPrompt] = useState('');
  const [retouchHotspot, setRetouchHotspot] = useState<RetouchHotspot | null>(null);

  // Crop state
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null);
  const [cropData, setCropData] = useState<any>(null);

  const tabs = [
    { key: 'adjust' as EditTab, name: '调整', icon: 'options', color: '#F59E0B' },
    { key: 'filters' as EditTab, name: '滤镜', icon: 'color-filter', color: '#8B5CF6' },
    { key: 'texture' as EditTab, name: '纹理', icon: 'layers', color: '#10B981' },
    { key: 'erase' as EditTab, name: '抠图', icon: 'cut', color: '#F97316' },
    { key: 'crop' as EditTab, name: '裁剪', icon: 'crop', color: '#EF4444' },
    { key: 'fusion' as EditTab, name: '合成', icon: 'git-merge', color: '#8B5CF6' },
    { key: 'retouch' as EditTab, name: '修饰', icon: 'brush', color: '#06B6D4' },
  ];

  const currentImage = history[historyIndex] || image;

  useEffect(() => {
    // Initialize history with the original image
    const initialHistory: EditHistory = {
      id: '0',
      uri: image.uri,
      operation: 'original',
      timestamp: Date.now(),
    };
    setHistory([initialHistory]);
    setHistoryIndex(0);
  }, [image]);

  // Handle back button
  useEffect(() => {
    const onBackPress = () => {
      if (historyIndex > 0) {
        Alert.alert(
          '确认退出',
          '您有未保存的编辑，确定要退出吗？',
          [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive', onPress: onBack },
          ]
        );
        return true;
      } else {
        onBack();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [historyIndex, onBack]);

  const updateHistory = (newUri: string, operation: string) => {
    const newHistory: EditHistory = {
      id: Date.now().toString(),
      uri: newUri,
      operation,
      timestamp: Date.now(),
    };
    
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newHistory);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    
    // Reset single-use state
    setRetouchHotspot(null);
    setCropData(null);
  };

  const runAiOperation = async (operation: () => Promise<string>, operationName: string) => {
    setIsLoading(true);
    try {
      const resultUri = await operation();
      updateHistory(resultUri, operationName);
    } catch (error) {
      Alert.alert('处理失败', error instanceof Error ? error.message : '处理图像时发生未知错误');
      console.error(`${operationName} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit operations
  const handleApplyFilter = (prompt: string) => {
    setLastAction({ type: 'filters', prompt });
    runAiOperation(() => aiService.applyFilter(currentImage.uri, prompt), '滤镜');
  };

  const handleApplyAdjustment = (prompt: string) => {
    setLastAction({ type: 'adjust', prompt });
    runAiOperation(() => aiService.applyAdjustment(currentImage.uri, prompt), '调整');
  };

  const handleApplyTexture = (prompt: string) => {
    setLastAction({ type: 'texture', prompt });
    runAiOperation(() => aiService.applyTexture(currentImage.uri, prompt), '纹理');
  };

  const handleRemoveBackground = () => {
    setLastAction({ type: 'erase' });
    runAiOperation(() => aiService.removeBackground(currentImage.uri), '抠图');
  };

  const handleApplyFusion = (sourceImages: ImageAsset[], prompt: string) => {
    setLastAction({ type: 'fusion', prompt, sourceImages });
    runAiOperation(() => aiService.fuseImages(currentImage.uri, sourceImages, prompt), '合成');
  };

  const handleApplyRetouch = () => {
    if (retouchPrompt && retouchHotspot) {
      setLastAction({ type: 'retouch', prompt: retouchPrompt, hotspot: retouchHotspot });
      runAiOperation(
        () => aiService.applyRetouch(currentImage.uri, retouchPrompt, retouchHotspot),
        '修饰'
      );
      setRetouchPrompt('');
    }
  };

  const handleApplyCrop = async () => {
    if (!cropData) {
      Alert.alert('提示', '请先选择要裁剪的区域');
      return;
    }

    setIsLoading(true);
    try {
      const croppedUri = await cropImage(currentImage.uri, cropData);
      updateHistory(croppedUri, '裁剪');
    } catch (error) {
      Alert.alert('裁剪失败', error instanceof Error ? error.message : '裁剪图像时发生未知错误');
      console.error('Crop error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleRegenerate = () => {
    if (!lastAction || historyIndex < 1) return;

    const previousImage = history[historyIndex - 1];
    setHistoryIndex(historyIndex - 1);

    switch (lastAction.type) {
      case 'filters':
        if (lastAction.prompt) {
          runAiOperation(() => aiService.applyFilter(previousImage.uri, lastAction.prompt!), '滤镜');
        }
        break;
      case 'adjust':
        if (lastAction.prompt) {
          runAiOperation(() => aiService.applyAdjustment(previousImage.uri, lastAction.prompt!), '调整');
        }
        break;
      case 'texture':
        if (lastAction.prompt) {
          runAiOperation(() => aiService.applyTexture(previousImage.uri, lastAction.prompt!), '纹理');
        }
        break;
      case 'erase':
        runAiOperation(() => aiService.removeBackground(previousImage.uri), '抠图');
        break;
      case 'retouch':
        if (lastAction.prompt && lastAction.hotspot) {
          runAiOperation(
            () => aiService.applyRetouch(previousImage.uri, lastAction.prompt!, lastAction.hotspot!),
            '修饰'
          );
        }
        break;
      case 'fusion':
        if (lastAction.prompt && lastAction.sourceImages) {
          runAiOperation(
            () => aiService.fuseImages(previousImage.uri, lastAction.sourceImages!, lastAction.prompt!),
            '合成'
          );
        }
        break;
    }
  };

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限需求', '需要媒体库权限才能保存图片');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(currentImage.uri);
      Alert.alert('保存成功', '图片已保存到相册');
    } catch (error) {
      Alert.alert('保存失败', '保存图片时发生错误');
      console.error('Save error:', error);
    }
  };

  const renderPanel = () => {
    const panelProps = {
      currentImage: { ...currentImage, width: image.width, height: image.height },
      isLoading,
    };

    switch (activeTab) {
      case 'adjust':
        return <AdjustmentPanel {...panelProps} onApplyAdjustment={handleApplyAdjustment} />;
      case 'filters':
        return <FilterPanel {...panelProps} onApplyFilter={handleApplyFilter} />;
      case 'texture':
        return <TexturePanel {...panelProps} onApplyTexture={handleApplyTexture} />;
      case 'erase':
        return <ErasePanel onRemoveBackground={handleRemoveBackground} isLoading={isLoading} />;
      case 'crop':
        return (
          <CropPanel
            onApplyCrop={handleApplyCrop}
            onSetAspectRatio={setCropAspectRatio}
            isLoading={isLoading}
            isCropping={!!cropData}
          />
        );
      case 'fusion':
        return <FusionPanel onApplyFusion={handleApplyFusion} isLoading={isLoading} />;
      case 'retouch':
        return (
          <View style={styles.retouchPanel}>
            <Text style={styles.retouchTitle}>智能修饰</Text>
            <Text style={styles.retouchInstructions}>在图像上点击一个点，然后描述您想做的更改。</Text>
            {/* Add TextInput and apply button here */}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#090A0F', '#1B2735', '#090A0F']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Aice PS</Text>
        
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isLoading}>
          <Ionicons name="download" size={24} color={isLoading ? "#6B7280" : "white"} />
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <EditingCanvas
          image={{ ...currentImage, width: image.width, height: image.height }}
          isLoading={isLoading}
          showComparison={isComparing}
          originalImage={history[0] ? { ...history[0], width: image.width, height: image.height } : undefined}
          activeTab={activeTab}
          onHotspotPress={setRetouchHotspot}
          retouchHotspot={retouchHotspot}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={handleUndo}
          disabled={historyIndex <= 0 || isLoading}
          style={[styles.actionButton, (historyIndex <= 0 || isLoading) && styles.disabledButton]}
        >
          <Ionicons name="arrow-undo" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleRedo}
          disabled={historyIndex >= history.length - 1 || isLoading}
          style={[styles.actionButton, (historyIndex >= history.length - 1 || isLoading) && styles.disabledButton]}
        >
          <Ionicons name="arrow-redo" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={!lastAction || historyIndex < 1 || isLoading}
          style={[styles.actionButton, (!lastAction || historyIndex < 1 || isLoading) && styles.disabledButton]}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPressIn={() => setIsComparing(true)}
          onPressOut={() => setIsComparing(false)}
          disabled={isLoading || history.length < 2}
          style={[styles.actionButton, (isLoading || history.length < 2) && styles.disabledButton]}
        >
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: tab.color },
            ]}
            onPress={() => {
              setActiveTab(tab.key);
              setRetouchHotspot(null);
            }}
            disabled={isLoading}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? tab.color : '#9CA3AF'}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? tab.color : '#9CA3AF' },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Panel */}
      <View style={styles.panelContainer}>
        {renderPanel()}
      </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  canvasContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  panelContainer: {
    height: 300,
    padding: 16,
  },
  retouchPanel: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  retouchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  retouchInstructions: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default EditorScreen;