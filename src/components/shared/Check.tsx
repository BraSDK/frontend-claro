

export const CheckGuardado = ({ texto, color }: { texto: string; color: 'success' | 'warning' }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-control bg-surface/80 backdrop-blur-sm">
    <div className={`anim-salto flex h-20 w-20 items-center justify-center rounded-full ${color === 'success' ? 'bg-success' : 'bg-amber-500'}`}>
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path className="anim-trazo" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-ink">{texto}</p>
  </div>
);