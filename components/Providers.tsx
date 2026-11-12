"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { PaletteProvider } from "./CommandPalette";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PaletteProvider>{children}</PaletteProvider>
    </MotionConfig>
  );
}
