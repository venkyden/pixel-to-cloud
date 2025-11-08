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
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                transition-all duration-300
                ${isCompleted 
                  ? 'bg-success text-white' 
                  : isActive 
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <div className={`
                mt-2 text-xs font-medium text-center whitespace-nowrap
                ${isActive ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-0.5 flex-1 mx-2 transition-all duration-300
                ${isCompleted ? 'bg-success' : 'bg-muted'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};
