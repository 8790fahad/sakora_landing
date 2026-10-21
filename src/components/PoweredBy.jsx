export default function PoweredBy({ className = "" }) {
  return (
    <p className={`text-center text-xs text-slate-400 ${className}`.trim()}>
      Powered by{" "}
      <a
        href="https://nexifour.ng"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-slate-500 hover:text-teal-700"
      >
        Nexifour Limited
      </a>
    </p>
  );
}
