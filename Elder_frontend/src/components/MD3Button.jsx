import React, { useRef, useState } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  Animated, 
  View 
} from 'react-native';
import { md3Colors, md3Typography, md3Radii, md3Elevation } from '../theme/md3Tokens';

export default function MD3Button({
  onPress,
  title,
  variant = 'filled', // 'filled', 'tonal', 'outlined', 'text'
  disabled = false,
  style,
  textStyle,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  // Determine colors based on variant
  let backgroundColor = md3Colors.primary;
  let textColor = md3Colors.onPrimary;
  let borderColor = 'transparent';
  let borderWidth = 0;
  let overlayColor = md3Colors.onPrimary; // Usually white or primary for text/outlined

  switch (variant) {
    case 'tonal':
      backgroundColor = md3Colors.secondaryContainer;
      textColor = md3Colors.onSecondaryContainer;
      overlayColor = md3Colors.onSecondaryContainer;
      break;
    case 'outlined':
      backgroundColor = 'transparent';
      textColor = md3Colors.primary;
      borderColor = md3Colors.outline;
      borderWidth = 1;
      overlayColor = md3Colors.primary;
      break;
    case 'text':
      backgroundColor = 'transparent';
      textColor = md3Colors.primary;
      overlayColor = md3Colors.primary;
      break;
    case 'filled':
    default:
      backgroundColor = md3Colors.primary;
      textColor = md3Colors.onPrimary;
      overlayColor = md3Colors.onPrimary; // 20% white on hover/press
      break;
  }

  const animateToHover = () => {
    Animated.timing(overlayOpacityAnim, {
      toValue: 0.08, // Material You hover state layer opacity
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateToRest = () => {
    Animated.timing(overlayOpacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityAnim, {
        toValue: 0.12, // Material You pressed state layer opacity
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityAnim, {
        toValue: isHovered ? 0.08 : 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }] },
      style
    ]}>
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
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: disabled ? md3Colors.onSurface + '1F' : backgroundColor,
            borderColor: disabled ? md3Colors.onSurface + '1F' : borderColor,
            borderWidth,
            opacity: disabled ? 0.38 : 1, // disabled state opacity
          },
          (variant === 'filled' || variant === 'tonal') && !disabled ? md3Elevation.level1 : {}
        ]}
      >
        <Animated.View style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: overlayColor,
            opacity: overlayOpacityAnim,
            borderRadius: md3Radii.full,
          }
        ]} />
        <Text style={[
          styles.text,
          { color: disabled ? md3Colors.onSurface + '61' : textColor },
          textStyle
        ]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: md3Radii.full,
    paddingHorizontal: 24,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  text: {
    ...md3Typography.labelLarge,
    textAlign: 'center',
  },
});
