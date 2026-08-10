import HexField from "./HexField.jsx";

export default function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-120 overflow-hidden">
      <HexField className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/5 to-transparent" />
    </div>
  );
}
