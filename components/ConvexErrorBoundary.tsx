"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ConvexErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Convex query caught by boundary:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isConvexDeploying = this.state.error?.message?.includes("Could not find public function")

      return (
        <div className="mx-auto my-6 max-w-xl rounded-3xl border border-border bg-card p-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f0a830]/15 text-[#f0a830]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-[family-name:var(--font-syne)] text-base font-bold text-foreground">
                {isConvexDeploying ? "Convex Functions Syncing" : "Data Loading Notice"}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {isConvexDeploying
                  ? "Convex backend functions are deploying or syncing. If you're running locally, ensure 'npx convex dev' is running in your terminal."
                  : this.state.error?.message || "An error occurred while loading this section."}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#1db954] px-4 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
