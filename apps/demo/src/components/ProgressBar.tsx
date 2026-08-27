import './ProgressBar.css';

interface ProgressBarProps {
  percent: number;
  message?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  percent,
  message,
  showPercent = true,
}: ProgressBarProps) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <div className="progress-bar-info">
        {message && <span className="progress-bar-message">{message}</span>}
        {showPercent && (
          <span className="progress-bar-percent">{Math.round(percent)}%</span>
        )}
      </div>
    </div>
  );
}
