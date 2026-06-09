import sinalIcon from '../assets/sinal.svg';
import nsinalIcon from '../assets/nsinal.svg';

// ta recebendo as infos de online/offline

export function Sidebar({ rssi, conectado }) {
  return (
    <aside className="sidebar">
      {/* status */}
      <div className="status-card">
        <div className="section-title">Status do Sistema</div>

        <div className="status-row">
          <span className="status-label">Sincronização</span>
          {/* muda classe e texto dependendo se ta on ou off*/}
          <div className={conectado ? "status-online" : "status-offline"}>
            <div className={conectado ? "dot-online" : "dot-offline"} />
            <span className={conectado ? "online-text" : "offline-text"}>
              {conectado ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="precision-row"> 
          {/*pega os valores da esp*/}
          <span className="precision-label">BEACON_01</span>
          <span className="precision-value">{rssi?.BEACON_01 ?? '—'} dBm</span>
        </div>

        <div className="precision-row">
          <span className="precision-label">BEACON_02</span>
          <span className="precision-value">{rssi?.BEACON_02 ?? '—'} dBm</span>
        </div>

        <div className="separator" />
      </div>

      {/* zonas */}
      <div className="zones-list">
        <div className="zones-heading">
          <div className="section-title">Zonas Ativas</div>
        </div>

        <div className="zone-card-active">
          <div className="zone-header">
            <span className="zone-name">Zona 01</span>
            <img src={sinalIcon} style={{ width: '20px', height: '15px' }} />
          </div>
          <span className="zone-room">SALA CI - 102</span>
          <div className="zone-tags">
            <div className="tag"><span>WIFI-A</span></div>
            <div className="tag"><span>BLUETOOTH</span></div>
          </div>
        </div>

        <div className="zone-card-inactive">
          <div className="zone-header">
            <span className="zone-name">Zona 02</span>
            <img src={nsinalIcon} style={{ width: '20px', height: '15px' }} />
          </div>
          <span className="zone-room">SALA LIEPE 04</span>
        </div>
      </div>
    </aside>
  );
}
