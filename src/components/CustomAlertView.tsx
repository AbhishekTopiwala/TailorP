import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Dimensions, useColorScheme } from 'react-native';
import { useAppStore, CustomAlertButton } from '@/store/AppStore';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export function CustomAlertView() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { alertConfig, hideAlert } = useAppStore();

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (alertConfig) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [alertConfig]);

  if (!alertConfig) return null;

  const { title, message, buttons } = alertConfig;

  const alertButtons: CustomAlertButton[] = buttons && buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', style: 'default' }];

  const handleButtonPress = (btn: CustomAlertButton) => {
    hideAlert();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress?.();
      }, 60);
    }
  };

  // Determine Alert Type based on contents
  const lowercaseTitle = (title || '').toLowerCase();
  const lowercaseMessage = (message || '').toLowerCase();
  
  let alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  if (
    lowercaseTitle.includes('delete') || 
    lowercaseTitle.includes('remove') ||
    lowercaseMessage.includes('delete') ||
    lowercaseMessage.includes('remove')
  ) {
    alertType = 'warning';
  } else if (
    lowercaseTitle.includes('success') || 
    lowercaseTitle.includes('complete') || 
    lowercaseTitle.includes('done') || 
    lowercaseTitle.includes('created') ||
    lowercaseTitle.includes('booked') ||
    lowercaseTitle.includes('loaded') ||
    lowercaseTitle.includes('added') ||
    lowercaseTitle.includes('updated') ||
    lowercaseTitle.includes('valid') ||
    lowercaseTitle.includes('granted') ||
    lowercaseTitle.includes('✅')
  ) {
    alertType = 'success';
  } else if (
    lowercaseTitle.includes('error') || 
    lowercaseTitle.includes('fail') || 
    lowercaseTitle.includes('wrong') || 
    lowercaseTitle.includes('invalid') ||
    lowercaseMessage.includes('error') ||
    lowercaseMessage.includes('fail')
  ) {
    alertType = 'error';
  }

  const getTypeStyle = () => {
    switch (alertType) {
      case 'success':
        return {
          icon: 'check-circle' as const,
          color: colors.success || '#10B981',
          bg: (colors.success || '#10B981') + '15',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: '#F59E0B',
          bg: '#F59E0B15',
        };
      case 'error':
        return {
          icon: 'error-outline' as const,
          color: colors.error || '#EF4444',
          bg: (colors.error || '#EF4444') + '15',
        };
      case 'info':
      default:
        return {
          icon: 'info-outline' as const,
          color: colors.primary || '#3B82F6',
          bg: (colors.primary || '#3B82F6') + '15',
        };
    }
  };

  const typeStyle = getTypeStyle();

  return (
    <Modal
      transparent
      visible={!!alertConfig}
      animationType="none"
      onRequestClose={hideAlert}
    >
      <View style={s.overlay}>
        <Animated.View style={[s.backdrop, { opacity: opacityAnim }]} />

        <Animated.View style={[
          s.container, 
          { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}>
          {/* Header Icon */}
          <View style={[s.iconWrapper, { backgroundColor: typeStyle.bg }]}>
            <MaterialIcons name={typeStyle.icon} size={28} color={typeStyle.color} />
          </View>

          <Text style={[s.title, { color: colors.text }]}>{title}</Text>
          {message ? <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text> : null}

          <View style={[s.buttonContainer, alertButtons.length > 2 && { flexDirection: 'column' }]}>
            {alertButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              let buttonBg: string = colors.backgroundElement;
              let textColor: string = colors.text;

              if (isDestructive) {
                buttonBg = colors.error;
                textColor = '#FFFFFF';
              } else if (isCancel) {
                buttonBg = colors.backgroundSelected;
                textColor = colors.textSecondary;
              } else {
                buttonBg = colors.primary;
                textColor = '#FFFFFF';
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    s.button,
                    { backgroundColor: buttonBg, flex: alertButtons.length > 2 ? 0 : 1 },
                    alertButtons.length > 2 && { width: '100%', marginVertical: 4 },
                    isCancel && { borderWidth: 1, borderColor: colors.border }
                  ]}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.buttonText, { color: textColor }]}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
