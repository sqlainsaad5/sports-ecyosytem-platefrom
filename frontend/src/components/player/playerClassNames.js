/** Player panel — stadium_at_midnight (electric green accent) */

export const playerField =
  'w-full rounded-player-nested border border-white/[0.06] bg-player-container py-2.5 px-4 text-sm text-player-on-surface shadow-player-inset placeholder:text-player-on-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-player-green/35';

export const playerSelect = `${playerField} cursor-pointer appearance-none`;

export const playerLabel =
  'font-headline text-xs font-bold uppercase tracking-[0.18em] text-player-on-variant';

export const playerBtnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-player-green to-player-cyan px-8 py-3 font-bold text-player-on-accent shadow-player-cta transition-transform duration-300 hover:scale-105';

export const playerBtnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-player-green/40 bg-transparent px-8 py-3 font-bold text-player-green transition-colors hover:border-player-green hover:bg-player-green/10';

export const playerBtnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-transparent px-8 py-3 font-bold text-white transition-colors hover:bg-white/5';

/** Coach dashboard hero CTAs — Bebas + tracking (player accent on filled button) */
export const playerHeroBtnPrimary =
  'inline-flex items-center justify-center gap-2 bg-white px-8 py-3 font-display uppercase tracking-[0.2em] text-player-on-accent shadow-md transition-all hover:bg-player-on-surface';

export const playerHeroBtnSecondary =
  'inline-flex items-center justify-center gap-2 border-2 border-white px-8 py-3 font-display uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10';

export const playerBtnSm =
  'rounded-full bg-gradient-to-r from-player-green to-player-cyan px-5 py-2 text-xs font-bold uppercase tracking-wide text-player-on-accent shadow-player-cta transition-transform hover:scale-105';

export const playerBtnOutlineSm =
  'rounded-full border border-white/15 bg-player-inner px-4 py-2 text-xs font-semibold text-player-on-surface transition-colors hover:border-player-green/40 hover:text-player-green';

export const playerTableHead =
  'border-b border-white/[0.08] bg-player-container/95 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-player-on-variant backdrop-blur-sm';

export const playerTableRow = 'transition-colors hover:bg-white/[0.04]';

export const playerProfileInput =
  'w-full rounded-player-nested border border-white/[0.06] bg-player-highest p-4 text-sm font-medium text-player-on-surface shadow-player-inset transition-all focus:outline-none focus:ring-2 focus:ring-player-green/50';

export const playerProfileSaveBtn =
  'w-full rounded-player-nested bg-player-green py-4 font-headline font-bold uppercase tracking-[0.15em] text-player-on-accent shadow-[0_10px_30px_rgba(0,255,135,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(0,255,135,0.3)] disabled:opacity-60';

export const playerBadgeLive =
  'rounded-full border border-player-green/25 bg-player-highest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-player-green shadow-player-inset';

export const statusBadge = (tone) => {
  const map = {
    scheduled: 'bg-player-cyan/15 text-player-cyan',
    completed: 'bg-player-green/15 text-player-green',
    cancelled: 'bg-red-500/15 text-red-400',
    pending: 'bg-player-orange/15 text-player-orange',
    accepted: 'bg-player-green/15 text-player-green',
    rejected: 'bg-red-500/15 text-red-400',
  };
  return `rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${map[tone] || 'bg-white/10 text-white'}`;
};
