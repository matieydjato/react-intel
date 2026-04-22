interface SizedProps {
  /** Non-literal union — `string | number` is common in style props (CSS sizes, font weights). */
  size: string | number;
  /** Optional union with null. */
  width?: string | number | null;
  label: string;
}

export function Sized({ size, width, label }: SizedProps) {
  return (
    <div style={{ width: width ?? size }}>
      <span>{label}</span>
    </div>
  );
}
