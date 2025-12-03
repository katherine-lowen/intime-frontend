"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

function AspectRatio({
  ...props
}: React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root {...props} />
}

export { AspectRatio }
