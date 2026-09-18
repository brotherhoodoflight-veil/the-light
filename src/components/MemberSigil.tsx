import { polygonPoints, sigilSpec, starPolygon } from "@/lib/sigil";

interface MemberSigilProps {
  seed: string;
  size?: number;
  className?: string;
}

export function MemberSigil({ seed, size = 96, className = "" }: MemberSigilProps) {
  const spec = sigilSpec(seed);
  const rays = polygonPoints(spec.points, 34, spec.rotation + 20, 50, 50);
  const satellites = polygonPoints(
    spec.satellites,
    46,
    spec.rotation + 7,
    50,
    50,
  );
  const star = starPolygon(spec.points, spec.radius, spec.rotation, 50, 50);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="47" stroke="currentColor" opacity="0.28" />
      {satellites.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill="currentColor" opacity="0.8" />
      ))}
      {spec.glyphs &&
        rays.map(([cx, cy], i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={cx}
            y2={cy}
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.28"
          />
        ))}
      <path d={star} stroke="currentColor" strokeWidth="1.3" opacity="0.85" />
      <circle cx="50" cy="50" r="1.8" fill="currentColor" />
    </svg>
  );
}