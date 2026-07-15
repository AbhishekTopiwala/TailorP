import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧵',
    title: 'Precision Craft',
    description: 'Digitize your customer measurements, fit records, and style preferences with seamless precision.',
  },
  {
    emoji: '📋',
    title: 'Order Stepper',
    description: 'Track orders from fabric receipt through cutting, stitching, and trial to successful delivery.',
  },
  {
    emoji: '📅',
    title: 'Smarter Booking',
    description: 'Manage trial sessions and appointments with our integrated real-time schedule planner.',
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
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
        >
          <Text style={[s.skipTxt, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Carousel Content */}
      <View style={s.carouselContainer}>
        <Text style={s.slideEmoji}>{SLIDES[activeSlide].emoji}</Text>
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
                backgroundColor: activeSlide === idx ? colors.primary : colors.border,
                width: activeSlide === idx ? 20 : 8,
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
  skipTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -20,
  },
  slideEmoji: {
    fontSize: 72,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    marginBottom: 32,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingBottom: 24,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});
