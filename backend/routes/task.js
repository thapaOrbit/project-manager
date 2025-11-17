import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validate-schema.js";
import {
  archiveTask,
  addComment,
  addSubTask,
  createTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  getMyTasks,
  getTaskById,
  updateSubTask,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  watchTask,
  getArchivedTasks,
  addReaction,
  removeReaction,
  deleteTask,
  updateTaskDueDate,
  getCommentReplies,
  deleteComment,
} from "../controllers/task.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// ========== STATIC ROUTES FIRST ==========
router.get("/archived", authMiddleware, getArchivedTasks);
router.get("/my-tasks", authMiddleware, getMyTasks);

// ========== PARAMETERIZED ROUTES SECOND ==========
router.get(
  "/:taskId",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
  }),
  getTaskById
);

router.post(
  "/:projectId/create-task",
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: z.string(),
    }),
    body: taskSchema,
  }),
  createTask
);

router.post(
  "/:taskId/add-subtask",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  addSubTask
);

router.post(
  "/:taskId/add-comment",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ 
      text: z.string(),
      parentComment: z.string().optional().nullable(), 
    }),
  }),
  addComment
);

router.get(
  "/comments/:commentId/replies",
  authMiddleware,
  validateRequest({
    params: z.object({ commentId: z.string() }),
  }),
  getCommentReplies
);

router.post(
  "/:taskId/comments/:commentId/reactions",
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      commentId: z.string() 
    }),
    body: z.object({ 
      emoji: z.string() 
    }),
  }),
  addReaction
);

router.delete(
  "/:taskId/comments/:commentId/reactions",
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      commentId: z.string() 
    }),
    body: z.object({ 
      emoji: z.string() 
    }),
  }),
  removeReaction
);

router.post(
  "/:taskId/watch",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  watchTask
);

router.post(
  "/:taskId/archive",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  archiveTask
);

router.put(
  "/:taskId/update-subtask/:subTaskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string(), subTaskId: z.string() }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask
);

router.put(
  "/:taskId/title",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  updateTaskTitle
);

router.put(
  "/:taskId/description",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ description: z.string() }),
  }),
  updateTaskDescription
);

router.put(
  "/:taskId/status",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ status: z.string() }),
  }),
  updateTaskStatus
);

router.put(
  "/:taskId/assignees",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ assignees: z.array(z.string()) }),
  }),
  updateTaskAssignees
);

router.put(
  "/:taskId/priority",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ priority: z.string() }),
  }),
  updateTaskPriority
);

router.get(
  "/:resourceId/activity",
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: z.string() }),
  }),
  getActivityByResourceId
);

router.get(
  "/:taskId/comments",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  getCommentsByTaskId
);

router.delete(
  "/:taskId/comments/:commentId/reactions/:emoji",  
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      commentId: z.string(),
      emoji: z.string() 
    }),
  }),
  removeReaction
);

router.delete(
  "/:taskId/comments/:commentId",
  authMiddleware,
  validateRequest({
    params: z.object({ 
      taskId: z.string(),
      commentId: z.string() 
    }),
  }),
  deleteComment
);

// Delete task
router.delete(
  "/:taskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  deleteTask
);

router.put(
  "/:taskId/due-date",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ 
      dueDate: z.string().nullable().optional() 
    }),
  }),
  updateTaskDueDate
);

export default router;