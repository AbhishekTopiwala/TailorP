import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'straighten' as const,
    title: 'Precision Craft',
    description: 'Digitize customer measurements, fit records, and style preferences with seamless precision.',
  },
  {
    icon: 'assignment' as const,
    title: 'Order Tracker',
    description: 'Track orders from fabric receipt through cutting, stitching, and trial to successful delivery.',
  },
  {
    icon: 'event' as const,
    title: 'Smarter Booking',
    description: 'Manage trial sessions and appointments with our integrated real-time schedule planner.',
  },
];

export default function OnboardingScreen() {
  const colors = Colors.light; // Force light theme
  const { completeOnboarding } = useAppStore();
  const [activeSlide, setActiveSlide] = useState(0);

  function handleNext() {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      completeOnboarding();
      router.replace('/login');
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={() => {
            completeOnboarding();
            router.replace('/login');
          }}
          activeOpacity={0.7}
          style={s.skipBtn}
        >
          <Text style={[s.skipTxt, { color: colors.textSecondary }]}>Skip</Text>
          <MaterialIcons name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Slide Carousel Content */}
      <View style={s.carouselContainer}>
        <View style={[s.iconBg, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <MaterialIcons name={SLIDES[activeSlide].icon} size={44} color={colors.primary} />
        </View>
        <Text style={[s.slideTitle, { color: colors.text }]}>
          {SLIDES[activeSlide].title}
        </Text>
        <Text style={[s.slideDesc, { color: colors.textSecondary }]}>
          {SLIDES[activeSlide].description}
        </Text>
      </View>

      {/* Pagination Indicators */}
      <View style={s.indicatorRow}>
        {SLIDES.map((_, idx) => (
          <View
            key={idx}
            style={[
              s.indicator,
              {
                backgroundColor: activeSlide === idx ? colors.primary : colors.divider,
                width: activeSlide === idx ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom Button */}
      <View style={s.bottomContainer}>
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[s.primaryBtnTxt, { color: colors.onPrimary }]}>
            {activeSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBar: {
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skipTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -20,
  },
  iconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  slideDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    marginBottom: 40,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingBottom: 32,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});
