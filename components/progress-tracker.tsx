"use client"

import { Check } from "lucide-react"

interface ProgressTrackerProps {
  currentStep: number
  steps: string[]
  status?: "pending" | "accepted" | "rejected" | "donated"
}

export default function ProgressTracker({ currentStep, steps, status }: ProgressTrackerProps) {
  const getStepStatus = (stepIndex: number) => {
    // Step 0: Request Sent - Always completed (green) since request exists
    if (stepIndex === 0) {
      return "completed"
    }

    // Step 1: Donor Accepted
    if (stepIndex === 1) {
      if (status === "rejected") {
        return "rejected"
      }
      if (status === "accepted" || status === "donated") {
        return "completed"
      }
      return "pending"
    }

    // Step 2: Donation Completed
    if (stepIndex === 2) {
      if (status === "donated") {
        return "completed"
      }
      if (status === "accepted") {
        return "current"
      }
      return "pending"
    }

    return "pending"
  }

  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index)
        return (
          <div key={index} className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                stepStatus === "completed"
                  ? "bg-emerald-500 text-white"
                  : stepStatus === "rejected"
                    ? "bg-rose-500 text-white"
                    : stepStatus === "current"
                      ? "bg-sky-500 text-white"
                      : "bg-slate-300 text-slate-600"
              }`}
            >
              {stepStatus === "completed" ? (
                <Check className="h-4 w-4" />
              ) : stepStatus === "rejected" ? (
                <span className="text-xs">✕</span>
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-sm ${
                stepStatus === "completed"
                  ? "text-emerald-600 font-medium"
                  : stepStatus === "current"
                    ? "text-slate-900 font-medium"
                    : stepStatus === "rejected"
                      ? "text-rose-600 font-medium"
                      : "text-slate-500"
              }`}
            >
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
