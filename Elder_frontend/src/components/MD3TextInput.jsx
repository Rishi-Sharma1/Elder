import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  Animated 
} from 'react-native';
import { md3Colors, md3Typography, md3Radii } from '../theme/md3Tokens';

export default function MD3TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = false,
  errorText,
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const activeColor = error ? md3Colors.error : md3Colors.primary;
  
  const bottomBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? md3Colors.error : md3Colors.outline, activeColor]
  });

  const bottomBorderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2]
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: isFocused ? activeColor : md3Colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: md3Colors.onSurface }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={md3Colors.onSurfaceVariant + '80'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <Animated.View 
          style={[
            styles.bottomBorder, 
            { 
              backgroundColor: bottomBorderColor,
              height: bottomBorderWidth,
            }
          ]} 
        />
      </View>
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    ...md3Typography.labelMedium,
    marginBottom: 4,
  },
  inputContainer: {
    backgroundColor: md3Colors.surfaceVariant, // Muted background
    borderTopLeftRadius: md3Radii.extraSmall, // typically 4px or small 8px for MD3 inputs. Let's use 8px.
    borderTopRightRadius: md3Radii.extraSmall,
    height: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  input: {
    ...md3Typography.bodyLarge,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  errorText: {
    ...md3Typography.bodySmall,
    color: md3Colors.error,
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
