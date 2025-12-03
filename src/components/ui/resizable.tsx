"use client"

import * as React from "react"
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
} from "react-resizable-panels"

import { cn } from "./utils"

type ResizablePanelGroupProps = PanelGroupProps & {
  className?: string
}

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  )
}

type ResizablePanelProps = PanelProps & {
  className?: string
}

function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return (
    <Panel
      className={cn("flex flex-col overflow-hidden", className)}
      {...props}
    />
  )
}

type ResizableHandleProps = React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean
}

function ResizableHandle({
  className,
  withHandle = true,
  ...props
}: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      className={cn(
        "relative flex items-center justify-center bg-slate-900/40 transition-colors hover:bg-slate-800/60 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:w-px",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="pointer-events-none data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-6 data-[panel-group-direction=horizontal]:h-6 data-[panel-group-direction=horizontal]:w-1 rounded-full bg-slate-600/80" />
      )}
    </PanelResizeHandle>
  )
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
}
