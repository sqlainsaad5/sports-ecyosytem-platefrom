export default function PlayerPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="player-display-hero font-display text-4xl uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed tracking-wide text-player-on-variant">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
