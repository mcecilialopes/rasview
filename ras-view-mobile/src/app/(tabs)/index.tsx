import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard
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

  // Estados para gerenciar as medidas da sala
  const [medidasSala, setMedidasSala] = useState({ x: 3.3, y: 5.5 });
  const [inputX, setInputX] = useState('3.3');
  const [inputY, setInputY] = useState('5.5');

  // Função para salvar e aplicar os testes no mapa
  const aplicarMedidas = () => {
    setMedidasSala({
      x: parseFloat(inputX) || 3.3,
      y: parseFloat(inputY) || 5.5,
    });
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(249,249,252,0.95)" />

      <Header />

      <View style={styles.bgDecoration}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardCard}>
          <View style={styles.headerSection}>
            <View style={styles.headerTitles}>
              <Text style={styles.dashboardTitle}>Dashboard de Orientação</Text>
              <Text style={styles.dashboardSubtitle}>Ambiente atual: {medidasSala.x}m x {medidasSala.y}m</Text>
            </View>

            {/* Nova área para alterar as medidas do mapa */}
            <View style={styles.configArea}>
               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Largura (X):</Text>
                  <TextInput 
                    style={styles.input} 
                    value={inputX} 
                    onChangeText={setInputX} 
                    keyboardType="numeric" 
                  />
               </View>
               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Comprimento (Y):</Text>
                  <TextInput 
                    style={styles.input} 
                    value={inputY} 
                    onChangeText={setInputY} 
                    keyboardType="numeric" 
                  />
               </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={aplicarMedidas} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>Atualizar Mapa</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dashboardGrid}>
            <View style={styles.centralArea}>
              {/* Passando as medidas dinâmicas para o mapa */}
              <SpatialMap posicao={posicao} medidas={medidasSala} />
              <RobotArea />
            </View>

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

  configArea: { 
    flexDirection: 'row', 
    gap: 10, flexWrap: 'wrap', 
    alignItems: 'flex-end',
    marginTop: 10, padding: 10, 
    backgroundColor: 'rgba(0,0,0,0.03)',
     borderRadius: 8 },
  inputGroup: { 
    flexDirection: 'column', 
    gap: 4 },
  inputLabel: { 
    fontSize: 12, 
    color: '#5b3f43', 
    fontWeight: '500' },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, borderColor: '#e4bdc2',
    borderRadius: 4, width: 70, height: 36,
    textAlign: 'center', 
    color: '#1a1c1e' },
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