import React, { useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Pressable,
  Platform
} from 'react-native';
import { md3Colors, md3Radii, md3Elevation } from '../theme/md3Tokens';

export default function MD3Card({
  children,
  style,
  onPress,
  hoverable = false,
  disabled = false,
  variant = 'elevated', // 'elevated', 'filled', 'outlined'
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  let backgroundColor = md3Colors.surfaceContainer;
  let borderColor = 'transparent';
  let borderWidth = 0;
  
  const baseElevation = variant === 'elevated' ? md3Elevation.level1 : md3Elevation.level0;

  if (variant === 'filled') {
    backgroundColor = md3Colors.surfaceContainerHighest || md3Colors.surfaceVariant;
  } else if (variant === 'outlined') {
    backgroundColor = md3Colors.surface;
    borderColor = md3Colors.outlineVariant;
    borderWidth = 1;
  }

  const animateToHover = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1, // represents moving to level 2 elevation
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const animateToRest = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1, 
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: isHovered ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const shadowColor = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      baseElevation.shadowColor || 'transparent', 
      md3Elevation.level2.shadowColor
    ]
  });

  const shadowOffset = {
    width: 0,
    height: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [baseElevation.shadowOffset?.height || 0, md3Elevation.level2.shadowOffset.height]
    })
  };

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseElevation.shadowOpacity || 0, md3Elevation.level2.shadowOpacity]
  });

  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseElevation.shadowRadius || 0, md3Elevation.level2.shadowRadius]
  });

  const elevation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseElevation.elevation || 0, md3Elevation.level2.elevation]
  });

  const CardContent = (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor,
        borderColor,
        borderWidth,
        transform: [{ scale: scaleAnim }],
        shadowColor,
        shadowOffset,
        shadowOpacity,
        shadowRadius,
        elevation,
      },
      style
    ]}>
      {children}
    </Animated.View>
  );

  if (onPress || hoverable) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={() => {
          setIsHovered(true);
          animateToHover();
        }}
        onHoverOut={() => {
          setIsHovered(false);
          animateToRest();
        }}
        disabled={disabled}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: md3Radii.large, // 24px typically
    padding: 24,
    overflow: 'hidden',
  }
});
