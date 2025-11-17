import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Task actions
        "created_task",
        "updated_task",
        "deleted_task",
        "completed_task",
        "moved_task",
        "assigned_task",
        "unassigned_task",
        "watched_task",
        "unwatched_task",
        "archived_task",
        "unarchived_task",

        // Subtask actions
        "created_subtask",
        "updated_subtask",
        "deleted_subtask",
        "completed_subtask",

        // Project actions
        "created_project",
        "updated_project",
        "deleted_project",
        "completed_project",
        "archived_project",
        "restored_project",

        // Workspace actions
        "created_workspace",
        "updated_workspace",
        "deleted_workspace",
        "joined_workspace",
        "left_workspace",
        "transferred_workspace_ownership",

        // Member actions
        "added_member",
        "removed_member",
        "updated_member_role",

        // Comment actions
        "added_comment",
        "updated_comment",
        "deleted_comment",

        // Reaction actions
        "added_reaction",
        "removed_reaction",

        // Attachment actions
        "added_attachment",
        "removed_attachment",
        "updated_attachment",

        // General actions
        "viewed",
        "exported",
        "imported",
      ],
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        "Task",
        "Project",
        "Workspace",
        "Comment",
        "User",
        "Attachment",
        "Subtask",
      ],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Object,
    },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
