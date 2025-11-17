import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        // Task notifications
        "TASK_ASSIGNED",
        "TASK_MENTIONED", 
        "TASK_DUE_SOON",
        "TASK_DUE_TODAY",
        "TASK_OVERDUE",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",
        "TASK_UPDATED",
        "TASK_COMMENT_ADDED",
        "TASK_SUBTASK_ADDED",
        "TASK_COMPLETED",
        "TASK_DELETED",
        
        // Project notifications
        "PROJECT_CREATED",
        "PROJECT_UPDATED", 
        "PROJECT_DUE_SOON",
        "PROJECT_DUE_TODAY",
        "PROJECT_OVERDUE",
        "PROJECT_DELETED",
        
        // Workspace notifications
        "WORKSPACE_INVITATION",
        "WORKSPACE_UPDATED",
        "WORKSPACE_OWNERSHIP_TRANSFERRED",
        "NEW_MEMBER_JOINED",
        "WORKSPACE_DELETED",
        
        // Comment notifications
        "COMMENT_MENTIONED",
        "COMMENT_REPLY",
        "REACTION_ADDED"
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    relatedUsers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    expiresAt: {
      type: Date,
      default: function() {
        // Notifications expire after 30 days
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;