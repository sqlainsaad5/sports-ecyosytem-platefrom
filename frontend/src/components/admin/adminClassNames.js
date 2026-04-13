/** Shared SEP admin UI classes — matches admin pannel HTML mocks (no behavior change). */

export const adminField =
  'rounded-lg border-0 bg-admin-surface-low py-2 pl-3 pr-3 text-sm text-admin-on-surface placeholder:text-slate-500 transition-all focus:outline-none focus:ring-1 focus:ring-admin-cyan/50';

export const adminSelect = `${adminField} appearance-none cursor-pointer`;

export const adminBtnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-cyan to-admin-cyan-deep px-5 py-2.5 font-headline text-sm font-bold uppercase tracking-widest text-white transition-all hover:shadow-admin-glow';

export const adminBtnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/70 bg-admin-surface-high px-5 py-2.5 font-headline text-sm font-bold uppercase tracking-widest text-slate-200 transition-colors hover:bg-admin-surface-highest';

export const adminBtnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs font-medium text-admin-cyan transition-colors hover:border-admin-cyan/35 hover:bg-admin-cyan/5';

export const adminBtnCompactPrimary =
  'rounded-lg bg-gradient-to-r from-admin-cyan to-admin-cyan-deep px-3 py-1.5 font-headline text-xs font-bold uppercase tracking-wide text-white transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.35)]';

export const adminBtnCompactGhost =
  'rounded-lg border border-white/15 bg-transparent px-3 py-1.5 font-headline text-xs font-semibold text-slate-300 transition-colors hover:border-admin-cyan/25 hover:bg-white/5 hover:text-admin-cyan';

export const adminTableHead =
  'border-b border-white/5 bg-admin-surface/90 text-left text-[11px] font-headline font-bold uppercase tracking-wider text-slate-500 backdrop-blur-sm';

export const adminTableRow = 'border-b border-transparent transition-colors hover:bg-white/[0.04]';

export const adminPillLive = 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400';

export const adminPillPending = 'rounded-full bg-admin-orange/10 px-2 py-0.5 text-[10px] font-bold text-admin-orange';
