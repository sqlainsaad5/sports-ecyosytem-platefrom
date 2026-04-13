export default function AdminIcon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
      {name}
    </span>
  );
}
