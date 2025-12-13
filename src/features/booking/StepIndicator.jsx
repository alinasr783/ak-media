export default function StepIndicator({currentStep}) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {/* Step 1 */}
        <div
          className={`flex flex-col items-center ${
            currentStep === 1 ? "text-primary" : "text-muted-foreground"
          }`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              currentStep === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
            1
          </div>
          <span className="text-xs">بيانات المريض</span>
        </div>

        {/* Line between steps */}
        <div className="mx-4 h-px w-16 bg-muted"></div>

        {/* Step 2 */}
        <div
          className={`flex flex-col items-center ${
            currentStep === 2 ? "text-primary" : "text-muted-foreground"
          }`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              currentStep === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
            2
          </div>
          <span className="text-xs">بيانات الحجز</span>
        </div>
      </div>
    </div>
  );
}
