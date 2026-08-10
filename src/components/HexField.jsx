const HEX_POINTS =
  "193.7959442138672,0 258.39459228515625,111.79247283935547 193.7959442138672,223.58494567871094 64.59864044189453,223.58494567871094 0,111.79246520996094 64.59866333007812,0";

const HEX_MATRIX_PREFIX =
  "matrix(0.9396926164627075,-0.3420201539993286,0.3420201539993286,0.9396926164627075,";

// Offsets come straight from the Figma export ("Poligono 1/2/3/5"); they share
// one coordinate space, so combining them with a matching viewBox reproduces
// the original layout without guessing positions.
const HEX_OFFSETS = [
  [23.3713321685791, 307.0960693359375],
  [-125.239013671875, 482.4830627441406],
  [101.02359771728516, 522.6480102539062],
  [-47.976402282714844, 698.6480102539062],
];

export default function HexField({ className = "" }) {
  return (
    <svg
      viewBox="63.37 340 545.545 690.029"
      preserveAspectRatio="xMinYMin slice"
      className={className}
      aria-hidden="true"
    >
      <g fill="#7a7a85" fillOpacity="0.28">
        {HEX_OFFSETS.map(([tx, ty], i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`${HEX_MATRIX_PREFIX}${tx},${ty})`}
          />
        ))}
      </g>
    </svg>
  );
}
