import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const updateTitle = () => {
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update title");
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
      {isEditing ? (
        <Input
        className="text-xl font-semibold flex-1 min-w-0 w-full sm:w-auto"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <h2 className="text-xl font-semibold flex-1 break-words">{title}</h2>
      )}

      {isEditing ? (
        <Button
        className="py-0 sm:ml-2 w-full sm:w-auto" 
          size="sm"
          onClick={updateTitle}
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
