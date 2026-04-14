export default function PlayerIcon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
      {name}
    </span>
  );
}
