


import SvgMapa from '../assets/mapa.svg';
import rasLogo from '../assets/ras.svg';

export function Header() {
  return (
    <header className="header-top-app-bar">
      <div className="header-left">
        <div className="heading-1">
          <span className="ras-view">RAS View</span>
        </div>
        <nav className="nav-wrapper">
          <div className="nav-link">
            <img
          src={SvgMapa}
          alt="Robot"
            />
            <span className="nav-label">MAPA</span>
          </div>
        </nav>
      </div>
      <div className="robot-header-badge">
        <img src={rasLogo} alt="Logo RAS" className="w-8 h-8" />
      </div>
    </header>
  );
}
