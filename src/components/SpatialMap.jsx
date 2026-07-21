  const SALA_X = 3.3; // metros
  const SALA_Y = 8.8; // metros

  export function SpatialMap({ posicao }) {
    console.log('posicao recebida no SpatialMap:', posicao);

    // Converte x/y (metros) em % dentro do map-floor, com margem de 5% nas bordas
    const pinLeft = posicao ? `${((posicao.x / SALA_X) * 90 + 5).toFixed(1)}%` : '50%';
    const pinTop  = posicao ? `${((posicao.y / SALA_Y) * 90 + 5).toFixed(1)}%` : '50%';

    const coordText = posicao
      ? `COORD: ${posicao.y.toFixed(1)}N, ${posicao.x.toFixed(1)}W`
      : 'COORD: --';

    return(
    <div className="spatial-map">
      <div className="map-floor">
        {/* mapa */}
        <div className="map-wall" />

        {/* mesa */}
        <div className="map-table">
          <span className="map-label">MESA</span>
        </div>

        {/* entrada point */}
        <div className="map-entrada">
          <span>ENTRADA</span>
        </div>

        {/* voce point */}
        <div className="map-you">
        
          <div className="you-pin" />
          <div className="you-label">
            <div className="you-label-inner">
              <span>VOCÊ</span>
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div className="map-overlay">
          <div className="compass">
            <span>N</span>
          </div>
          <span className="coord-text">{coordText}</span>
        </div>
      </div>
    </div>
  );
}
