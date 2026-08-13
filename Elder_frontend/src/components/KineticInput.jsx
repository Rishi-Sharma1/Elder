import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet,
  Platform 
} from 'react-native';
import { kineticColors, kineticBorders, kineticSpacing, kineticTypography } from '../theme/kineticTokens';

export default function KineticInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  numberOfLines,
  style,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isWeb = Platform.OS === 'web';

  const borderColor = error ? kineticColors.error : isFocused ? kineticColors.accent : kineticColors.border;
  
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, error && { color: kineticColors.error }]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        { borderBottomColor: borderColor }
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || (label ? `ENTER ${label.toUpperCase()}` : '')}
          placeholderTextColor={kineticColors.muted}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...(isWeb && { outlineStyle: 'none' })} // Remove web default focus ring
          {...props}
        />
      </View>
      
      {error && typeof error === 'string' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: kineticSpacing.lg,
    width: '100%',
  },
  label: {
    ...kineticTypography.label,
    color: kineticColors.mutedForeground,
    marginBottom: kineticSpacing.sm,
  },
  inputContainer: {
    borderBottomWidth: kineticBorders.width * 2, // Thicker border for kinetic style
    backgroundColor: kineticColors.transparent,
  },
  input: {
    height: 64, // Reduced from 96 to fit typical forms better
    color: kineticColors.foreground,
    fontSize: 20, // Reduced from 32 to prevent horizontal overflow
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    paddingHorizontal: 0, // No horizontal padding
    paddingVertical: kineticSpacing.md,
  },
  multilineInput: {
    height: 'auto',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: kineticColors.error, // Will add to tokens if missing, defaults to red typically but let's assume it exists or use inline
    fontSize: 14,
    marginTop: kineticSpacing.xs,
    fontWeight: '500',
  }
});
