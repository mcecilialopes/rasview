
import robotsvg from '../assets/Robot.svg';
//para o futuro
export function RobotArea() {
  return (
    <div className="robot-area">
      <div className="robot-content">
        <h4 className="robot-title">Precisa de ajuda?</h4>
        <p className="robot-desc">
          O robô assistente está pronto para guiar você pelo ambiente em tempo real.
        </p>
        <button className="btn-falar">
          <span>FALAR AGORA</span>
        </button>
      </div>
      <img
        className="robot-mascot"
        src={robotsvg}
        alt="Robot mascot"
      />
    </div>
  );
}
