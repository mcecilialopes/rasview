import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// posicao: { x, y, d0, d1, maisPerto } | null
// A posição é mapeada para % da sala (sala tem 5.5m de comprimento no eixo Y)
// No mapa, usamos left/top em porcentagem para posicionar o pino

const SALA_Y = 5.5; // metros — comprimento entre os dois beacons

export function SpatialMap({ posicao }) {
  // Converte posição em metros → porcentagem do mapa (0–100%)
  // Eixo Y do beacon vai de 0 (topo) a 5.5m (base), mapeado em top
  const pinTop  = posicao ? `${((posicao.y / SALA_Y) * 80 + 5).toFixed(1)}%` : '59%';
  const pinLeft = '25%'; // sem dado X real, mantém centralizado

  const coordText = posicao
    ? `COORD: ${posicao.y.toFixed(1)}N, ${posicao.x.toFixed(1)}W`
    : 'COORD: —';

  return (
    <View style={styles.spatialMap}>
      <View style={styles.mapFloor}>
        {/* Parede lateral */}
        <View style={styles.mapWall} />

        {/* Mesa */}
        <View style={styles.mapTable}>
          <Text style={styles.mapLabel}>MESA</Text>
        </View>

        {/* Entrada */}
        <View style={styles.mapEntrada}>
          <Text style={styles.mapEntradaText}>ENTRADA</Text>
        </View>

        {/* Pino VOCÊ — posição dinâmica */}
        <View style={[styles.mapYou, { top: pinTop, left: pinLeft }]}>
          <View style={styles.youPin} />
          <View style={styles.youLabel}>
            <View style={styles.youLabelInner}>
              <Text style={styles.youLabelText}>VOCÊ</Text>
            </View>
          </View>
        </View>

        {/* Overlay bússola + coordenadas */}
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
