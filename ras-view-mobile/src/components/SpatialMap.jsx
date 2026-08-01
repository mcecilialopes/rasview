import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Agora o componente recebe "medidas" além da "posicao"
export function SpatialMap({ posicao, medidas }) {
  // Converte posição em metros → porcentagem do mapa (0–100%)
  // Usamos as medidas passadas por prop em vez de valores fixos
  const pinTop  = posicao ? `${((posicao.y / medidas.y) * 80 + 5).toFixed(1)}%` : '59%';
  const pinLeft = posicao ? `${((posicao.x / medidas.x) * 80 + 5).toFixed(1)}%` : '25%'; 

  const coordText = posicao
    ? `COORD: ${posicao.y.toFixed(1)}N, ${posicao.x.toFixed(1)}W`
    : 'COORD: —';

  return (
    <View style={styles.spatialMap}>
      <View style={styles.mapFloor}>
        <View style={styles.mapWall} />
        <View style={styles.mapTable}>
          <Text style={styles.mapLabel}>MESA</Text>
        </View>
        <View style={styles.mapEntrada}>
          <Text style={styles.mapEntradaText}>ENTRADA</Text>
        </View>

        <View style={[styles.mapYou, { top: pinTop, left: pinLeft }]}>
          <View style={styles.youPin} />
          <View style={styles.youLabel}>
            <View style={styles.youLabelInner}>
              <Text style={styles.youLabelText}>VOCÊ</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapOverlay}>
          <View style={styles.compass}>
            <Text style={styles.compassText}>N</Text>
          </View>
          <Text style={styles.coordText}>{coordText}</Text>
        </View>
      </View>
    </View>
  );
}
const BORDER_COLOR = 'rgba(228,189,194,0.4)';

const styles = StyleSheet.create({
  spatialMap: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(228,189,194,0.3)',
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 240,
  },
  mapFloor: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#5b3f43',
    backgroundColor: '#fdf5f6',
    position: 'relative',
  },
  mapWall: {
    backgroundColor: '#5b3f43',
    width: 14,
    position: 'absolute',
    left: 2,
    top: '33%',
    bottom: '41%',
  },
  mapTable: {
    backgroundColor: '#e8e8ea',
    borderWidth: 2,
    borderColor: '#e4bdc2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '14%',
    height: '18%',
    left: '28%',
    top: '10%',
  },
  mapLabel: {
    color: '#5b3f43',
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  mapEntrada: {
    backgroundColor: '#ffd6f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#814b7f',
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'absolute',
    left: '10%',
    top: '8%',
  },
  mapEntradaText: {
    color: '#350537',
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  mapYou: {
    alignItems: 'center',
    position: 'absolute',
  },
  youPin: {
    backgroundColor: '#b80049',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 28,
    height: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  youLabel: {
    marginTop: -2,
    paddingTop: 4,
  },
  youLabelInner: {
    backgroundColor: '#b80049',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  youLabelText: {
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  mapOverlay: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
    padding: 8,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
  compass: {
    borderWidth: 2,
    borderColor: '#e4bdc2',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  compassText: {
    color: '#5b3f43',
    fontSize: 10,
    fontWeight: '700',
  },
  coordText: {
    color: '#5b3f43',
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
});
