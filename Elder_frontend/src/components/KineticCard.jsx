import React, { useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Pressable,
  Platform
} from 'react-native';
import { kineticColors, kineticBorders, kineticRadii, kineticSpacing } from '../theme/kineticTokens';

export default function KineticCard({
  children,
  style,
  onPress,
  hoverable = false,
  disabled = false,
  variant = 'elevated', // Kept for compatibility, though kinetic is mostly one style
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const isWeb = Platform.OS === 'web';

  // Base styles
  let backgroundColor = kineticColors.background;
  let borderColor = kineticColors.border;
  let borderWidth = kineticBorders.width;

  if (isHovered && isWeb && (hoverable || onPress)) {
    backgroundColor = kineticColors.accent;
    borderColor = kineticColors.accent;
  }

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const CardContent = (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor,
        borderColor,
        borderWidth,
        transform: [{ scale: scaleAnim }],
      },
      style
    ]}>
      {/* If children is a function, we can pass isHovered for text color changes */}
      {typeof children === 'function' ? children({ isHovered: isHovered && isWeb }) : children}
    </Animated.View>
  );

  if (onPress || (hoverable && isWeb)) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={isWeb ? () => setIsHovered(true) : undefined}
        onHoverOut={isWeb ? () => setIsHovered(false) : undefined}
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
    borderRadius: kineticRadii.none, // 0px
    padding: kineticSpacing.lg, // 32px
    overflow: 'hidden',
  }
});
