import React from "react"
import { Check, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Step = ({ title, description, stepLogo, isCompleted, isActive }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center",
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : isActive
              ? "border-primary"
              : "border-muted",
             
          )}
        >
          {isCompleted ? <Check className="w-4 h-4" /> :  <span className="text-sm font-medium">{stepLogo?stepLogo:title[0]}</span>}
        </div>
      </div>
      <div className="ml-4">
        <p className={cn("text-sm font-medium", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </p>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

 function Stepper({ steps, currentStep, onStepChange,className }) {
  return (
    <>
    {/* // <div className="w-full max-w-3xl mx-auto"> */}
      <div        className={cn("flex flex-col md:flex-row justify-betwee justify-evenly items-start md:items-center gap-4 mb-8", className)} >
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <Step
            stepLogo={step.stepLogo}
              title={step.title}
              description={step.description}
              isCompleted={index < currentStep}
              isActive={index === currentStep}
              />
            {index < steps.length - 1 && <ChevronRight className="hidden md:block text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
     

        </>
  )
}



export { Stepper, Step }