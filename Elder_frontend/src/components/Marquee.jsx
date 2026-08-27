import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { kineticColors, kineticTypography, kineticBorders } from '../theme/kineticTokens';

export default function Marquee({
  text,
  speed = 50, // Lower is faster conceptually in terms of "pixels per second", here we will use it as a duration multiplier
  textColor = kineticColors.accent,
  bgColor = kineticColors.background,
  textStyle,
  style
}) {
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (textWidth > 0) {
      translateX.value = 0;
      // Duration based on text width to maintain constant speed
      // The larger the text, the longer the duration needed to scroll it at same speed
      const duration = (textWidth / speed) * 1000;
      
      translateX.value = withRepeat(
        withTiming(-textWidth, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1, // infinite repeat
        false // don't reverse
      );
    }
  }, [textWidth, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // We repeat the text multiple times to ensure the loop is seamless
  // The first block scrolls off, the second takes its place
  const repeatedText = `${text} \u2022 `.repeat(4);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Animated.View style={[styles.textRow, animatedStyle]}>
        <Text
          onLayout={(e) => {
            // Divide by 4 because we repeated 4 times, we need the base width of the single segment
            setTextWidth(e.nativeEvent.layout.width / 4);
          }}
          style={[styles.text, { color: textColor }, textStyle]}
          numberOfLines={1}
        >
          {repeatedText}
        </Text>
        {/* We duplicate the text to fill the gap when the first one wraps around */}
        <Text style={[styles.text, { color: textColor }, textStyle]} numberOfLines={1}>
          {repeatedText}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: kineticBorders.width,
    borderBottomWidth: kineticBorders.width,
    borderColor: kineticColors.border,
  },
  textRow: {
    flexDirection: 'row',
    width: 99999, // Ensure it doesn't wrap
  },
  text: {
    ...kineticTypography.subheading,
  }
});
