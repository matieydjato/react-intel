import { memo, type ReactNode } from "react";

export interface DataCardProps {
  title: string;
  isLoading?: boolean;
  children?: ReactNode;
}

function DataCardImpl({ title, isLoading, children }: DataCardProps) {
  return (
    <article aria-busy={isLoading}>
      <h3>{title}</h3>
      {isLoading ? <p>Loading…</p> : <div>{children}</div>}
    </article>
  );
}

export const DataCard = memo(DataCardImpl);
