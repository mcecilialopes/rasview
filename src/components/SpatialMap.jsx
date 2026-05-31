
export function SpatialMap() {
  return (
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
          <span className="coord-text">COORD: 5.2N, 2.4W</span>
        </div>
      </div>
    </div>
  );
}
