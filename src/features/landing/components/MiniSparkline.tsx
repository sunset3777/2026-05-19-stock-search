type MiniSparklineProps = {
  values: number[];
  variant?: "small" | "large";
};

export function MiniSparkline({ values, variant = "small" }: MiniSparklineProps) {
  const width = variant === "large" ? 420 : 140;
  const height = variant === "large" ? 112 : 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
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
        stroke="#60a5fa"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={variant === "large" ? 4 : 3}
      />
    </svg>
  );
}
