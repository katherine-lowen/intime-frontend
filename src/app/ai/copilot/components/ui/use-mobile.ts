"use client";

import * as React from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Guard for SSR (shouldn't run anyway, but just in case)
    if (typeof window === "undefined") return;

    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const update = () => setIsMobile(query.matches);
    update();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    } else {
      // older browsers / TS lib
      // @ts-ignore
      query.addListener(update);
      // @ts-ignore
      return () => query.removeListener(update);
    }
  }, [breakpoint]);

  return isMobile;
}
