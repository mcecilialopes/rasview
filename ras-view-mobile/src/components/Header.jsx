import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


import SvgMapa from '../assets/mapa.svg';
import RasLogo from '../assets/ras.svg';

export function Header() {
  return (
    <View style={styles.headerTopAppBar}>
      <View style={styles.headerLeft}>
        <Text style={styles.rasView}>RAS View</Text>
        <View style={styles.navWrapper}>
          <View style={styles.navLink}>
          <SvgMapa width={16} height={16} /> 
            <Text style={styles.navLabel}>MAPA</Text>
          </View>
        </View>
      </View>

      <View style={styles.robotHeaderBadge}>
       <RasLogo width={102} height={55} /> 
        <Text style={styles.badgeText}>RAS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTopAppBar: {
    backgroundColor: 'rgba(249,249,252,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228,189,194,0.3)',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  rasView: {
    color: '#b80049',
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700',
  },
  navWrapper: {
    paddingLeft: 16,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  navLink: {
    borderBottomWidth: 2,
    borderBottomColor: '#b80049',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navLabel: {
    color: '#b80049',
    fontFamily: 'System',
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  robotHeaderBadge: {
    backgroundColor: 'rgba(243,243,246,0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(228,189,194,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#b80049',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});
