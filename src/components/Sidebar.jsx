// src/components/Sidebar.jsx

import sinalIcon from '../assets/sinal.svg';
import nsinalIcon from '../assets/nsinal.svg';


export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* status */}
      <div className="status-card">
        <div className="section-title">Status do Sistema</div>

        <div className="status-row">
          <span className="status-label">Sincronização</span>
          <div className="status-online">
            <div className="dot-online" />
            <span className="online-text">ONLINE</span>
          </div>
        </div>

        <div className="precision-row">
          <span className="precision-label">Precisão</span>
          <span className="precision-value">± 0.02m</span>
        </div>

        <div className="separator" />
      </div>

      {/* zonas*/}
      <div className="zones-list">
        <div className="zones-heading">
          <div className="section-title">Zonas Ativas</div>
        </div>

        {/* atividade das zonas  */}
        <div className="zone-card-active">
          <div className="zone-header">
            <span className="zone-name">Zona 01</span>
            <img 
                src={sinalIcon} 
                style={{ width: '20px', height: '15px' }} 
              />
          </div>
          <span className="zone-room">SALA CI - 102</span>
          <div className="zone-tags">
            <div className="tag"><span>WIFI-A</span></div>
            <div className="tag"><span>BLUETOOTH</span></div>
          </div>
        </div>

        {/* inativas */}
        <div className="zone-card-inactive">
          <div className="zone-header">
            <span className="zone-name">Zona 02</span>
            <img 
                src={nsinalIcon} 
                style={{ width: '20px', height: '15px' }} 
              />
          </div>
          <span className="zone-room">SALA LIEPE 04</span>
        </div>
      </div>
    </aside>
  );
}
