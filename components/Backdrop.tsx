export function Backdrop({ intensity = 1, className = "" }: { intensity?: number; className?: string }) {
  return (
    <div aria-hidden className={`grain pointer-events-none absolute inset-0 overflow-hidden bg-navy ${className}`}>
      <div className="blob left-[30%] top-[18%] h-[55%] w-[45%] bg-coral" style={{ opacity: 0.55 * intensity }} />
      <div className="blob left-[-10%] top-[-10%] h-[70%] w-[50%] bg-[#3E5C94]" style={{ opacity: 0.7 * intensity, animationDelay: "-6s" }} />
      <div className="blob right-[-8%] top-[5%] h-[60%] w-[40%] bg-[#7A8FB8]" style={{ opacity: 0.45 * intensity, animationDelay: "-12s" }} />
      <div className="blob bottom-[-25%] left-[10%] h-[50%] w-[70%] bg-[#0B1428]" style={{ opacity: 0.9, animationDelay: "-3s" }} />
      <div className="reeded absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 via-transparent to-navy-900" />
    </div>
  );
}
