import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


import RobotSvg from '../assets/Robot.svg';

export function RobotArea() {
  return (
    <View style={styles.robotArea}>
      <View style={styles.robotContent}>
        <Text style={styles.robotTitle}>Precisa de ajuda?</Text>
        <Text style={styles.robotDesc}>
          O robô assistente está pronto para guiar você pelo ambiente em tempo real.
        </Text>
        <TouchableOpacity style={styles.btnFalar} activeOpacity={0.8}>
          <Text style={styles.btnFalarText}>FALAR AGORA</Text>
        </TouchableOpacity>
      </View>

           <View style={styles.robotMascot}>
        <RobotSvg width={120} height={120} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  robotArea: {
    backgroundColor: 'rgba(226,22,95,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(184,0,73,0.2)',
    padding: 20,
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  robotContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  robotTitle: {
    color: '#b80049',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  robotDesc: {
    color: '#5b3f43',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 12,
  },
  btnFalar: {
    backgroundColor: '#b80049',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  btnFalarText: {
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  robotMascot: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  robotEmoji: {
    fontSize: 56,
  },
});
