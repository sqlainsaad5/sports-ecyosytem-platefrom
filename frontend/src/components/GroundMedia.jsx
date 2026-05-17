import { publicAssetUrl } from '../utils/assetUrl';
import { groundImageList, groundLocationLabel, isMapUrl } from '../utils/groundImages';

export function GroundPhotoGrid({ ground, className = '' }) {
  const images = groundImageList(ground);
  if (!images.length) return null;
  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${className}`}>
      {images.map((path, i) => (
        <img
          key={`${path}-${i}`}
          src={publicAssetUrl(path)}
          alt=""
          className="max-h-48 w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
}

export function GroundPhotoStrip({ ground, className = '' }) {
  const images = groundImageList(ground);
  if (!images.length) {
    return <div className={`h-20 w-full rounded-xl bg-black/30 ${className}`} aria-hidden />;
  }
  return (
    <div className={`flex gap-1 ${className}`}>
      {images.slice(0, 3).map((path, i) => (
        <img
          key={`${path}-${i}`}
          src={publicAssetUrl(path)}
          alt=""
          className="h-20 flex-1 min-w-0 rounded-lg object-cover"
        />
      ))}
      {images.length > 3 ? (
        <span className="flex h-20 w-10 shrink-0 items-center justify-center rounded-lg bg-black/40 text-[10px] font-bold text-slate-400">
          +{images.length - 3}
        </span>
      ) : null}
    </div>
  );
}

export function GroundLocationLine({ ground, linkClassName = 'underline-offset-2 hover:underline' }) {
  const loc = groundLocationLabel(ground);
  if (!loc) return null;
  return (
    <p className="mt-1 text-xs text-slate-400">
      Ground location:{' '}
      {isMapUrl(loc) ? (
        <a href={loc} target="_blank" rel="noreferrer" className={linkClassName}>
          Open map
        </a>
      ) : (
        <span>{loc}</span>
      )}
    </p>
  );
}

export function GroundOwnerLocationLine({ ground, linkClassName = 'underline-offset-2 hover:underline' }) {
  const loc = ground?.ownerLocation;
  if (!loc) return null;
  return (
    <p className="mt-1 text-xs text-slate-400">
      Owner location:{' '}
      {isMapUrl(loc) ? (
        <a href={loc} target="_blank" rel="noreferrer" className={linkClassName}>
          Open map
        </a>
      ) : (
        <span>{loc}</span>
      )}
    </p>
  );
}

/** Full ground info — photos, dimensions, owner, location (player / coach booking). */
export function GroundDetailsPanel({
  ground,
  linkClassName = 'text-player-green underline-offset-2 hover:underline',
  slotCheck = null,
  slotAvailableClassName = 'text-player-green',
}) {
  if (!ground) return null;
  const images = groundImageList(ground);

  return (
    <div className="space-y-3 text-sm text-player-on-surface">
      <GroundPhotoGrid ground={ground} />
      <div>
        <p className="text-lg font-bold text-white">{ground.name}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-player-on-variant">
          {ground.sportType}
          {ground.city ? ` · ${ground.city}` : ''}
        </p>
        {ground.description ? (
          <p className="mt-2 text-sm text-player-on-variant">{ground.description}</p>
        ) : null}
        <p className="mt-2 text-xs text-slate-400">
          Hours: {ground.openTime || '—'}–{ground.closeTime || '—'} · Slot {ground.slotDurationMinutes ?? 60} min
        </p>
        {ground.lengthFeet || ground.areaSqFt ? (
          <p className="mt-1 text-xs text-slate-400">
            {ground.lengthFeet ? `${ground.lengthFeet} ft length` : null}
            {ground.lengthFeet && ground.areaSqFt ? ' · ' : null}
            {ground.areaSqFt ? `${Number(ground.areaSqFt).toLocaleString()} sq ft` : null}
            {images.length ? ` · ${images.length} photos` : null}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-400">
          Owner: {ground.ownerName} ·{' '}
          <a className={linkClassName} href={`tel:${ground.ownerPhone}`}>
            {ground.ownerPhone}
          </a>
        </p>
        <p className="mt-1 text-xs text-slate-400">Address: {ground.ownerAddress || ground.address || '—'}</p>
        <GroundLocationLine ground={ground} linkClassName={linkClassName} />
        <GroundOwnerLocationLine ground={ground} linkClassName={linkClassName} />
        {slotCheck ? (
          <p
            className={`mt-3 font-headline text-xs font-bold uppercase tracking-wider ${
              slotCheck.available ? slotAvailableClassName : 'text-red-400'
            }`}
          >
            {slotCheck.available
              ? 'Selected time slot is available'
              : 'Selected time slot is not available (booked or held)'}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Selectable ground card for browse grids */
export function GroundBrowseCard({ ground, selected, onSelect, accent = 'player' }) {
  const images = groundImageList(ground);
  const loc = groundLocationLabel(ground);
  const isCoach = accent === 'coach';
  const selectedBorder = isCoach
    ? 'border-[#ff7524] ring-2 ring-[#ff7524]/30'
    : 'border-player-green ring-2 ring-player-green/30';
  const hoverBorder = isCoach ? 'hover:border-[#ff7524]/40' : 'hover:border-player-green/40';
  const ctaClass = isCoach ? 'text-[#ff7524]' : 'text-player-green';

  return (
    <button
      type="button"
      onClick={() => onSelect(ground._id)}
      className={`w-full overflow-hidden rounded-2xl border bg-player-container p-0 text-left shadow-player-card transition-all ${
        selected ? selectedBorder : `border-white/10 ${hoverBorder}`
      }`}
    >
      <GroundPhotoStrip ground={ground} className="rounded-none" />
      <div className="p-4">
        <p className="font-bold text-white">{ground.name}</p>
        <p className="mt-1 text-xs capitalize text-player-on-variant">
          {ground.sportType}
          {ground.city ? ` · ${ground.city}` : ''}
        </p>
        {loc ? (
          <p className="mt-2 line-clamp-2 text-xs text-slate-400">
            {isMapUrl(loc) ? 'Map link available' : loc}
          </p>
        ) : null}
        {ground.lengthFeet || ground.areaSqFt ? (
          <p className="mt-2 text-xs text-slate-500">
            {ground.lengthFeet ? `${ground.lengthFeet} ft` : null}
            {ground.lengthFeet && ground.areaSqFt ? ' · ' : null}
            {ground.areaSqFt ? `${Number(ground.areaSqFt).toLocaleString()} sq ft` : null}
            {images.length ? ` · ${images.length} photos` : null}
          </p>
        ) : null}
        <p className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${ctaClass}`}>
          {selected ? 'Selected' : 'Select to book'}
        </p>
      </div>
    </button>
  );
}
