import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { md3Colors, md3Radii } from '../../theme/md3Tokens';

export function SpotlightCard({ children, style, spotlightColor = md3Colors.primary, onPress }) {
  const isWeb = Platform.OS === 'web';
  const mouseX = useSharedValue(0);
  const mouseY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePointerMove = (e) => {
    if (!isWeb) return;
    // Use locationX/Y for coordinates relative to the element
    mouseX.value = e.nativeEvent.locationX ?? e.nativeEvent.offsetX ?? 0;
    mouseY.value = e.nativeEvent.locationY ?? e.nativeEvent.offsetY ?? 0;
  };

  const handleHoverIn = () => {
    if (isWeb) opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1.02, { duration: 200 });
  };

  const handleHoverOut = () => {
    if (isWeb) opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(1, { duration: 200 });
  };
  
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 200 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const spotlightStyle = useAnimatedStyle(() => {
    const size = 300;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: mouseX.value - size / 2 },
        { translateY: mouseY.value - size / 2 },
      ],
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });
  
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View style={[styles.container, style, cardAnimatedStyle]}>
      <Pressable
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.pressableContainer}
        // @ts-ignore - RN Web supports onMouseMove
        onMouseMove={handlePointerMove}
      >
        {/* Spotlight Glow - only active on Web environments */}
        {isWeb && (
          <Animated.View
            style={[
              styles.spotlight,
              { backgroundColor: spotlightColor },
              spotlightStyle
            ]}
          />
        )}
        
        {/* Inner Content Container */}
        <View style={styles.innerCard}>
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // The "un-hovered" border color
    backgroundColor: md3Colors.outlineVariant, 
    borderRadius: md3Radii.large,
    padding: 1.5, // 1.5px border
    overflow: 'hidden',
  },
  pressableContainer: {
    flex: 1,
    position: 'relative',
  },
  spotlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    // Blur filter works out-of-the-box on react-native-web
    // @ts-ignore
    filter: 'blur(50px)',
  },
  innerCard: {
    backgroundColor: md3Colors.surfaceContainerHighest,
    borderRadius: md3Radii.large - 1.5,
    flex: 1,
    overflow: 'hidden',
  }
});
