import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";

export default function WorkingHours({
  availableTime,
  onTimeChange,
  onDayToggle,
  getDayName,
}) {
  return (
    <div className="space-y-2">
      <Label>أوقات العمل</Label>
      <p className="text-xs text-muted-foreground">
        حدد أوقات العمل اليومية للعيادة
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {Object.entries(availableTime).map(([day, times]) => (
          <div
            key={day}
            className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium capitalize text-sm">
                {getDayName(day)}
              </h4>
              <Button
                type="button"
                variant={times.off ? "default" : "outline"}
                size="sm"
                onClick={() => onDayToggle(day)}
                className={`h-8 px-3 text-xs ${
                  times.off
                    ? "bg-red-500 hover:bg-red-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}>
                {times.off ? "إجازة" : "عمل"}
              </Button>
            </div>
            {!times.off && (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`${day}-start`}
                    className="text-xs text-muted-foreground">
                    من
                  </Label>
                  <Input
                    id={`${day}-start`}
                    type="time"
                    value={times.start}
                    onChange={(e) => onTimeChange(day, "start", e.target.value)}
                    className="h-9 text-sm px-2 py-1"
                  />
                </div>
                <div className="flex items-center justify-center h-9">
                  <span className="text-muted-foreground text-sm">-</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`${day}-end`}
                    className="text-xs text-muted-foreground">
                    إلى
                  </Label>
                  <Input
                    id={`${day}-end`}
                    type="time"
                    value={times.end}
                    onChange={(e) => onTimeChange(day, "end", e.target.value)}
                    className="h-9 text-sm px-2 py-1"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
