import './index.css';
import { Header } from './components/Header';
import { SpatialMap } from './components/SpatialMap';
import { RobotArea } from './components/RobotArea';
import { Sidebar } from './components/Sidebar';
import pontos from './assets/pontos.svg';

import atualiza from './assets/atualizar.svg';


export default function App() {
  return (
    <div className="rascunho">
      {/* decoração do fundo */}
      <div className="image-bg">
        <svg viewBox="0 0 1280 1280" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx="640" cy="640" r="600" fill="url(#bg-radial)" />
          <circle cx="640" cy="640" r="400" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="640" cy="640" r="200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>
      </div>

      {/* top navigation bar */}
      <Header />

      {/* main content */}
      <div className="container">
        <div className="main-content-canvas">
          <div className="dashboard-card">

            {/* Header */}
            <div className="header-section">
              <div className="header-titles">
                <h2 className="dashboard-title">Dashboard de Orientação</h2>
                <span className="dashboard-subtitle">Ambiente: CI 102 (35m²)</span>
              </div>
              <div className="header-actions">
                <button className="btn-outline">
                  <img src={pontos} alt="Info" style={{ width: '16px', height: '16px' }} />
                  <span>Ver Pontos de Interesse</span>
                </button>
                <button className="btn-primary">
                  <img src={atualiza} alt="Atualizar" style={{ width: '16px', height: '16px' }} />
                  <span>Atualizar Posição</span>
                </button>
              </div>
            </div>

            {/* grid */}
            <div className="dashboard-grid">
              {/* mapa + robo */}
              <div className="central-area">
                <SpatialMap />
                <RobotArea />
              </div>

              {/* barra lateral direita */}
              <Sidebar />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
