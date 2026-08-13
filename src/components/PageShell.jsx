import Footer from "./Footer.jsx";
import HeroBackdrop from "./HeroBackdrop.jsx";
import { HERO_GRADIENT } from "../lib/theme.js";

export default function PageShell({ children, onNavigate }) {
  return (
    <div className="min-h-dvh w-full" style={{ backgroundImage: HERO_GRADIENT }}>
      <div className="relative mx-auto min-h-dvh w-full max-w-120 overflow-hidden text-white">
        <HeroBackdrop />

        <div className="relative z-10 flex min-h-dvh flex-col">
          <div className="flex-1">{children}</div>
          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
