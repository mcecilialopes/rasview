import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWebSocket } from '../../hooks/useWebSocket';
import { usePosition } from '../../hooks/usePosition';

import { Header } from '../../components/Header';
import { SpatialMap } from '../../components/SpatialMap';
import { RobotArea } from '../../components/RobotArea';
import { Sidebar } from '../../components/Sidebar';

export default function HomeScreen() {
  const { rssi, conectado } = useWebSocket();
  const posicao = usePosition(rssi);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(249,249,252,0.95)" />

      {/* Top bar */}
      <Header />

      {/* Fundo decorativo */}
      <View style={styles.bgDecoration}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      {/* Conteúdo principal com scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard card */}
        <View style={styles.dashboardCard}>

          {/* Cabeçalho do card */}
          <View style={styles.headerSection}>
            <View style={styles.headerTitles}>
              <Text style={styles.dashboardTitle}>Dashboard de Orientação</Text>
              <Text style={styles.dashboardSubtitle}>Ambiente: CI 102 (35m²)</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.btnOutline} activeOpacity={0.7}>
                <Text style={styles.btnOutlineText}>Ver Pontos de Interesse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>Atualizar Posição</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Área central: mapa + robô */}
          <View style={styles.dashboardGrid}>
            <View style={styles.centralArea}>
              <SpatialMap posicao={posicao} />
              <RobotArea />
            </View>

            {/* Sidebar */}
            <Sidebar conectado={conectado} rssi={rssi} />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#400014' 
  },
  bgDecoration: { 
    ...StyleSheet.absoluteFill,
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: -1,                 // Ggarante que fique atrás de tudo
  },
  bgCircle1: { 
    position: 'absolute', 
    width: 600, 
    height: 600, 
    borderRadius: 300, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  bgCircle2: { 
    position: 'absolute', 
    width: 300, 
    height: 300, 
    borderRadius: 150, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 32 
  },
  dashboardCard: { 
    backgroundColor: 'rgba(249,249,252,0.97)', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 24, 
    elevation: 10 
  },
  headerSection: { 
    padding: 20, 
    gap: 12 
  },
  headerTitles: { 
    gap: 4 
  },
  dashboardTitle: { 
    color: '#1a1c1e', 
    fontSize: 20, 
    fontWeight: '600' 
  },
  dashboardSubtitle: { 
    color: '#5b3f43', 
    fontSize: 14, 
    fontWeight: '400' 
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: 10, 
    flexWrap: 'wrap' 
  },
  btnOutline: { 
    borderRadius: 4, 
    borderWidth: 1, 
    borderColor: '#814b7f', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnOutlineText: { 
    color: '#814b7f', 
    fontSize: 13, 
    fontWeight: '400' 
  },
  btnPrimary: { 
    backgroundColor: '#b80049', 
    borderRadius: 4, 
    paddingHorizontal: 16, 
    paddingVertical: 9, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnPrimaryText: { 
    color: '#ffffff', 
    fontSize: 13, 
    fontWeight: '400' 
  },
  dashboardGrid: { 
    padding: 16, 
    gap: 16 
  },
  centralArea: { 
    gap: 12, 
    minHeight: 380 
  },
});