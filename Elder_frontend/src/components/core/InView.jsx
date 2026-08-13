import React, { useEffect, useState, useRef } from 'react';
import { View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function InView({ children, variants, transition, style, viewOptions }) {
  const [isInView, setIsInView] = useState(false);
  const viewRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const margin = viewOptions?.margin || '0px';
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (viewOptions?.once !== false) {
              observer.disconnect();
            }
          } else if (viewOptions?.once === false) {
            setIsInView(false);
          }
        },
        { rootMargin: margin, threshold: 0.1 }
      );

      if (viewRef.current) {
        // In react-native-web, the ref of a View points directly to the DOM node
        observer.observe(viewRef.current);
      }
      return () => {
        observer.disconnect();
      };
    } else {
      // On Native (iOS/Android), simulate entering view immediately for now
      const timer = setTimeout(() => setIsInView(true), 150);
      return () => clearTimeout(timer);
    }
  }, [viewOptions]);

  // Extract values outside the worklet to avoid complex object serialization issues
  const hiddenOpacity = variants?.hidden?.opacity ?? 0;
  const visibleOpacity = variants?.visible?.opacity ?? 1;
  const hiddenY = variants?.hidden?.y ?? 0;
  const visibleY = variants?.visible?.y ?? 0;
  const hiddenX = variants?.hidden?.x ?? 0;
  const visibleX = variants?.visible?.x ?? 0;
  const hiddenScale = variants?.hidden?.scale ?? 1;
  const visibleScale = variants?.visible?.scale ?? 1;
  
  const duration = transition?.duration ? transition.duration * 1000 : 400;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isInView ? visibleOpacity : hiddenOpacity, { duration }),
      transform: [
        { translateY: withTiming(isInView ? visibleY : hiddenY, { duration }) },
        { translateX: withTiming(isInView ? visibleX : hiddenX, { duration }) },
        { scale: withTiming(isInView ? visibleScale : hiddenScale, { duration }) },
      ]
    };
  }, [isInView, duration]);

  return (
    <View ref={viewRef} style={style}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </View>
  );
}
