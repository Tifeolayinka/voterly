import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { n: 1, label: "Basic Info" },
  { n: 2, label: "Positions" },
  { n: 3, label: "Access" },
  { n: 4, label: "Publish" },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step.n < current
                  ? "bg-primary text-primary-foreground"
                  : step.n === current
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step.n < current ? <Check className="h-4 w-4" /> : step.n}
            </div>
            <span
              className={cn(
                "hidden sm:block text-xs whitespace-nowrap",
                step.n === current
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-12 sm:w-20 mx-2 mb-4",
                step.n < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
