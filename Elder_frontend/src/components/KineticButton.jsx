import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Animated, 
  Pressable, 
  Text, 
  View,
  Platform 
} from 'react-native';
import { kineticColors, kineticTypography, kineticBorders, kineticSpacing } from '../theme/kineticTokens';

export default function KineticButton({
  title,
  onPress,
  variant = 'primary', // 'primary', 'outline', 'ghost', 'text'
  style,
  textStyle,
  disabled = false,
  icon,
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const isWeb = Platform.OS === 'web';

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Base styling
  let bgColor = kineticColors.transparent;
  let textColor = kineticColors.foreground;
  let borderColor = kineticColors.transparent;
  let borderWidth = 0;

  if (variant === 'primary' || variant === 'filled') {
    bgColor = kineticColors.accent;
    textColor = kineticColors.accentForeground;
  } else if (variant === 'outline' || variant === 'outlined') {
    borderColor = kineticColors.border;
    borderWidth = kineticBorders.width;
    
    // Hover logic for outline on web
    if (isHovered && isWeb) {
      bgColor = kineticColors.foreground;
      textColor = kineticColors.accentForeground;
    }
  } else if (variant === 'ghost' || variant === 'text') {
    if (isHovered && isWeb) {
      textColor = kineticColors.accent;
    }
  }

  // Handle disabled state
  const opacity = disabled ? 0.5 : 1;

  // Size styling
  let height = 56;
  let paddingHorizontal = kineticSpacing.lg;
  
  if (size === 'small') {
    height = 40;
    paddingHorizontal = kineticSpacing.md;
  } else if (size === 'large') {
    height = 80;
    paddingHorizontal = kineticSpacing.xl;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={isWeb ? () => setIsHovered(true) : undefined}
      onHoverOut={isWeb ? () => setIsHovered(false) : undefined}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: bgColor,
            borderColor,
            borderWidth,
            opacity,
            height,
            paddingHorizontal,
            transform: [{ scale: scaleAnim }]
          },
          style
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0, // Sharp corners
  },
  iconContainer: {
    marginRight: kineticSpacing.sm,
  },
  text: {
    fontFamily: 'Space Grotesk', // If loaded, otherwise system default
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    fontSize: 16, // Fixed size for buttons generally works better in RN, but can scale
  }
});
