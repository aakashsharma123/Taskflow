"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";

export default function WorkspaceTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      {children}
    </m.div>
  );
}
