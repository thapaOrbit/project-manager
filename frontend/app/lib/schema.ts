import { ProjectStatus } from "@/types";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
      .max(100, "Password is too long"),
    name: z.string()
      .min(1, "Name is required")
      .regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
      .refine((name) => (name.match(/[A-Za-z]/g) || []).length >= 3, {
        message: "Name must contain at least 3 letters"
      }),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  export const resetPasswordSchema = z
  .object({
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const workspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  color: z.string().min(1, "Color is required"),
  description: z.string().max(500, "Description is too long").optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .min(1, "At least one member is required") 
    .max(50, "Too many project members"),
  tags: z.string().max(200, "Tags are too long").optional(),
});

export const createTaskSchema = z.object({
  title: z.string()
    .min(1, "Task title is required")
    .max(200, "Title is too long"),
  description: z.string()
    .max(2000, "Description is too long")
    .optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string()
    .min(1, "Due date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .refine((date) => new Date(date) >= new Date(), {
      message: "Due date must be in the future or today"
    }),
  assignees: z.array(z.string())
    .min(1, "At least one assignee is required")
    .max(20, "Too many assignees"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});