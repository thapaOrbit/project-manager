import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateTaskDueDateMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskDueDateSelectorProps {
  dueDate: Date | null | undefined;
  taskId: string;
  isCompleted?: boolean;
}

export const TaskDueDateSelector = ({
  dueDate,
  taskId,
  isCompleted = false,
}: TaskDueDateSelectorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );

  const { mutate: updateDueDate, isPending } = useUpdateTaskDueDateMutation();

  const handleSave = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    updateDueDate(
      { taskId, dueDate: selectedDate },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleCancel = () => {
    setSelectedDate(dueDate ? new Date(dueDate) : undefined);
    setIsEditing(false);
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date() && !isCompleted;

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <p
              className={cn(
                "text-sm",
                isOverdue ? "text-red-600 font-medium" : "text-foreground"
              )}
            >
              {dueDate
                ? format(new Date(dueDate), "MMMM dd, yyyy")
                : "No due date"}
              {isOverdue && " (Overdue)"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            {dueDate ? "Change" : "Set Date"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
      <div className="p-3 border rounded-lg space-y-3">
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "MMMM dd, yyyy")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !selectedDate}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
