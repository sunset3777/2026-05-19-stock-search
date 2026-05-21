type MiniSparklineProps = {
  values: number[];
  variant?: "small" | "large";
};

export function MiniSparkline({ values, variant = "small" }: MiniSparklineProps) {
  const width = variant === "large" ? 420 : 140;
  const height = variant === "large" ? 112 : 48;
  const safeValues = values.length > 0 ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = max - min || 1;
  const points = safeValues
    .map((value, index) => {
      const x = safeValues.length === 1 ? width / 2 : (index / (safeValues.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        points={points}
        stroke="#2563eb"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={variant === "large" ? 4 : 3}
      />
    </svg>
  );
}
