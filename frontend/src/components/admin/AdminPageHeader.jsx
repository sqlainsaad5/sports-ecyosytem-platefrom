export default function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-admin-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
