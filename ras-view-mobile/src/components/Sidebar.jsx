import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


import SinalIcon from '../assets/sinal.svg';
import NSinalIcon from '../assets/nsinal.svg';

export function Sidebar({ rssi, conectado }) {
  return (
    <View style={styles.sidebar}>
      {/* Status do sistema */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Status do Sistema</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Sincronização</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.dot, conectado ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.statusText, conectado ? styles.textOnline : styles.textOffline]}>
              {conectado ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <View style={styles.precisionRow}>
          <Text style={styles.precisionLabel}>BEACON_01</Text>
          <Text style={styles.precisionValue}>{rssi?.BEACON_01 ?? '—'} dBm</Text>
        </View>

        <View style={styles.precisionRow}>
          <Text style={styles.precisionLabel}>BEACON_02</Text>
          <Text style={styles.precisionValue}>{rssi?.BEACON_02 ?? '—'} dBm</Text>
        </View>

        <View style={styles.separator} />
      </View>

      {/* Zonas ativas */}
      <View style={styles.zonesList}>
        <View style={styles.zonesHeading}>
          <Text style={styles.sectionTitle}>Zonas Ativas</Text>
        </View>

        {/* Zona ativa */}
        <View style={styles.zoneCardActive}>
          <View style={styles.zoneHeader}>
            <Text style={styles.zoneName}>Zona 01</Text>
            <SinalIcon width={20} height={20}/>
          </View>
          <Text style={styles.zoneRoom}>SALA CI - 102</Text>
          <View style={styles.zoneTags}>
            <View style={styles.tag}><Text style={styles.tagText}>WIFI-A</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>BLUETOOTH</Text></View>
          </View>
        </View>

        {/* Zona inativa */}
        <View style={styles.zoneCardInactive}>
          <View style={styles.zoneHeader}>
            <Text style={styles.zoneName}>Zona 02</Text>
            <NSinalIcon width={20} height={20} />
          </View>
          <Text style={styles.zoneRoom}>SALA LIEPE 04</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    gap: 24,
  },

  // Status card
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(228,189,194,0.3)',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    color: '#5b3f43',
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusRow: {
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: '#1a1c1e',
    fontSize: 15,
    fontWeight: '400',
  },
  statusBadge: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: { backgroundColor: '#b80049' },
  dotOffline: { backgroundColor: '#9ca3af' },
  statusText: { fontSize: 14, fontWeight: '400' },
  textOnline: { color: '#b80049' },
  textOffline: { color: '#9ca3af' },
  precisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  precisionLabel: {
    color: '#1a1c1e',
    fontSize: 14,
    fontWeight: '400',
  },
  precisionValue: {
    color: '#814b7f',
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(228,189,194,0.3)',
  },

  // Zonas
  zonesList: {
    gap: 4,
  },
  zonesHeading: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  zoneCardActive: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b80049',
    borderLeftWidth: 4,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4,
  },
  zoneCardInactive: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(228,189,194,0.3)',
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoneName: {
    color: '#1a1c1e',
    fontSize: 18,
    fontWeight: '600',
  },
  sinalIcon: {
    fontSize: 16,
  },
  zoneRoom: {
    color: '#5b3f43',
    fontSize: 14,
    fontWeight: '400',
  },
  zoneTags: {
    paddingTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#ffd6f8',
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    color: '#350537',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
