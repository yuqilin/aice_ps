import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import StartScreen from './src/screens/StartScreen';
import EditorScreen from './src/screens/EditorScreen';
import PastForwardScreen from './src/screens/PastForwardScreen';
import { ImageAsset, View as ViewType } from './src/types';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('start');
  const [currentImage, setCurrentImage] = useState<ImageAsset | null>(null);

  const handleImageSelected = (image: ImageAsset) => {
    setCurrentImage(image);
    setActiveView('editor');
  };

  const handleImageGenerated = (imageUri: string) => {
    const generatedImage: ImageAsset = {
      uri: imageUri,
      width: 512, // Default dimensions for generated images
      height: 512,
      type: 'image/png',
      name: `generated-${Date.now()}.png`,
    };
    setCurrentImage(generatedImage);
    setActiveView('editor');
  };

  const handleBackToStart = () => {
    setCurrentImage(null);
    setActiveView('start');
  };

  const handleNavigateToEditor = () => {
    setActiveView('editor');
  };

  const handleNavigateToPastForward = () => {
    setActiveView('past-forward');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#090A0F" />
        
        {activeView === 'start' && (
          <StartScreen
            onImageSelected={handleImageSelected}
            onImageGenerated={handleImageGenerated}
            onNavigateToPastForward={handleNavigateToPastForward}
          />
        )}
        
        {activeView === 'editor' && currentImage && (
          <EditorScreen
            image={currentImage}
            onBack={handleBackToStart}
          />
        )}
        
        {activeView === 'past-forward' && (
          <PastForwardScreen
            onBack={handleBackToStart}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
});