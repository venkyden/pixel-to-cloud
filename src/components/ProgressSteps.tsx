import { Check } from "lucide-react";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                transition-all duration-500 shadow-md
                ${isCompleted 
                  ? 'bg-gradient-to-br from-success to-success/80 text-white shadow-success/30 scale-105' 
                  : isActive 
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground ring-4 ring-primary/30 scale-110 shadow-elegant' 
                    : 'glass-effect text-muted-foreground border border-border/50'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                ) : (
                  <span className={isActive ? 'animate-pulse' : ''}>{stepNumber}</span>
                )}
              </div>
              <div className={`
                mt-3 text-xs font-semibold text-center whitespace-nowrap px-2
                transition-all duration-300
                ${isActive ? 'text-foreground scale-105' : 'text-muted-foreground'}
              `}>
                {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-1 flex-1 mx-4 rounded-full transition-all duration-500 relative overflow-hidden
                ${isCompleted ? 'bg-gradient-to-r from-success to-success/80' : 'bg-muted'}
              `}>
                {isCompleted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
