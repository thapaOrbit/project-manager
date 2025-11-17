import type { TaskPriority } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useUpdateTaskPriorityMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
  priority,
  taskId,
}: {
  priority: TaskPriority;
  taskId: string;
}) => {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handlePriorityChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Priority
      </h3>

      <Select value={priority || ""} onValueChange={handlePriorityChange}>
        <SelectTrigger  className="w-[180px]" disabled={isPending}>
          <SelectValue placeholder="Change priority" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};