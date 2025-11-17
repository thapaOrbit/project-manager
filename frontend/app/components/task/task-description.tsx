import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskDescription = ({
  description,
  taskId,
}: {
  description: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update description");
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
      {isEditing ? (
        <Textarea
          className="flex-1 w-full min-w-0 break-words"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <div className="text-sm md:text-base text-pretty text-muted-foreground flex-1 break-words">
          {description}
        </div>
      )}

      {isEditing ? (
        <Button
          className="py-0 sm:ml-2 w-full sm:w-auto"
          size="sm"
          onClick={updateDescription}
          disabled={isPending}
        >
          Save
        </Button>
      ) : (
        <Edit
          className="size-3 cursor-pointer sm:ml-2"
          onClick={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};
