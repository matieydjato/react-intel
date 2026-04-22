import * as React from "react";
import type { ReactNode } from "react";

type Props = {
  bgType?: "image" | "video";
  bg: string;
  backDropBg?: string;
  children?: ReactNode;
};

export default function Hero({
  bgType = "image",
  bg,
  backDropBg = "linear-gradient(180deg, rgba(1, 1, 1, 0.5) 0%, rgba(1, 1, 1, 0.7) 100%)",
  children,
}: Props) {
  return (
    <div data-bg={bg}>
      {bgType === "video" && <video src={bg} />}
      <div style={{ background: backDropBg }}>{children}</div>
    </div>
  );
}
