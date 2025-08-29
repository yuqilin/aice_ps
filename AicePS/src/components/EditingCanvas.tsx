import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ImageAsset, RetouchHotspot } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EditingCanvasProps {
  image: ImageAsset;
  isLoading?: boolean;
  showComparison?: boolean;
  originalImage?: ImageAsset;
  activeTab?: string;
  onHotspotPress?: (hotspot: RetouchHotspot) => void;
  retouchHotspot?: RetouchHotspot | null;
}

const EditingCanvas: React.FC<EditingCanvasProps> = ({
  image,
  isLoading = false,
  showComparison = false,
  originalImage,
  activeTab,
  onHotspotPress,
  retouchHotspot,
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const resetTransform = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, []);

  const onImageLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  };

  const handleImagePress = useCallback((event: any) => {
    if (activeTab === 'retouch' && onHotspotPress) {
      const { locationX, locationY } = event.nativeEvent;
      
      // Convert touch coordinates to image coordinates
      const imageX = (locationX / imageLayout.width) * image.width;
      const imageY = (locationY / imageLayout.height) * image.height;
      
      onHotspotPress({
        x: Math.round(imageX),
        y: Math.round(imageY),
      });
    }
  }, [activeTab, onHotspotPress, image, imageLayout]);

  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (event) => {
      scale.value = Math.max(0.5, Math.min(event.scale || 1, 3));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
      if (scale.value > 2) {
        scale.value = withSpring(2);
      }
    },
  });

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX || 0;
        translateY.value = event.translationY || 0;
      }
    },
    onEnd: () => {
      // Constrain translation to keep image in bounds
      const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
      const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;
      
      translateX.value = withSpring(
        Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
      );
      translateY.value = withSpring(
        Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const displayImage = showComparison && originalImage ? originalImage : image;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <Text style={styles.loadingText}>AI 正在创作中...</Text>
            </View>
          </View>
        )}

        <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
          <Animated.View style={[StyleSheet.absoluteFill]}>
            <PanGestureHandler onGestureEvent={panGestureHandler}>
              <Animated.View style={[styles.gestureContainer, animatedStyle]}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleImagePress}
                  onLayout={onImageLayout}
                  style={styles.imageTouchable}
                >
                  <Image
                    source={{ uri: displayImage.uri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  
                  {/* Retouch hotspot indicator */}
                  {retouchHotspot && activeTab === 'retouch' && (
                    <View
                      style={[
                        styles.hotspot,
                        {
                          left: (retouchHotspot.x / image.width) * imageLayout.width - 12,
                          top: (retouchHotspot.y / image.height) * imageLayout.height - 12,
                        },
                      ]}
                    >
                      <Ionicons name="radio-button-on" size={24} color="#3B82F6" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>

        {/* Comparison indicator */}
        {showComparison && (
          <View style={styles.comparisonIndicator}>
            <Text style={styles.comparisonText}>正在对比原图</Text>
          </View>
        )}

        {/* Reset zoom button */}
        {scale.value > 1.1 && (
          <TouchableOpacity style={styles.resetButton} onPress={resetTransform}>
            <Ionicons name="contract" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth - 40,
    height: screenHeight * 0.6,
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContent: {
    backgroundColor: 'rgba(55, 65, 81, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  hotspot: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  comparisonIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  comparisonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditingCanvas;