import { useId } from "react";

const HEX_POINTS = "50,2 150,2 198,86.5 150,171 50,171 2,86.5";

export default function PlayerAvatar({ image, nickname, size = "h-10 w-10" }) {
  const clipId = useId();
  const initial = (nickname || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className={`relative ${size} shrink-0`}>
      <svg viewBox="0 0 200 173" className="absolute inset-0 h-full w-full">
        {image && (
          <>
            <clipPath id={clipId}>
              <polygon points={HEX_POINTS} />
            </clipPath>
            <image
              href={image}
              x="0"
              y="0"
              width="200"
              height="173"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
          </>
        )}
        <polygon
          points={HEX_POINTS}
          fill={image ? "none" : "currentColor"}
          fillOpacity={image ? 1 : 0.2}
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
      {!image && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {initial}
        </span>
      )}
    </div>
  );
}
