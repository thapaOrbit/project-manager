import { z } from "zod";

// Reusable schemas
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
  .max(100, "Password is too long");

const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email is too short")
  .max(254, "Email is too long")
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Invalid email format"
  )
  .transform((email) => email.toLowerCase().trim());

const dateSchema = z
  .string()
  .min(1, "Date is required")
  .refine((date) => !isNaN(Date.parse(date)), "Invalid date format");

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .regex(
    /^[A-Za-z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .refine((name) => (name.match(/[A-Za-z]/g) || []).length >= 3, {
    message: "Name must contain at least 3 letters",
  })
  .transform((name) => name.replace(/\s+/g, " ").trim())
  .refine(
    (name) => name.length >= 3,
    "Name must be at least 3 characters after cleaning"
  );

const safeStringSchema = (fieldName, maxLength = 255) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .max(maxLength, `${fieldName} is too long`)
    .refine(
      (val) => !/[<>$]/.test(val),
      `${fieldName} contains invalid characters`
    );

// Main schemas
const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .refine((data) => data.password.length >= 8, {
    message: "Password must be at least 8 characters long",
    path: ["password"],
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const emailSchemaObj = z.object({
  email: emailSchema,
});

const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const workspaceSchema = z.object({
  name: safeStringSchema("Workspace name", 100),
  description: z.string().max(500, "Description is too long").optional(),
  color: z.string().min(1, "Color is required"),
});

const projectSchema = z
  .object({
    title: safeStringSchema("Project title", 200),
    description: z.string().max(1000, "Description is too long").optional(),
    status: z.enum([
      "Planning",
      "In Progress",
      "On Hold",
      "Completed",
      "Cancelled",
    ]),
    startDate: dateSchema,
    dueDate: dateSchema.refine((dueDate) => {
      if (!dueDate) return true;
      return new Date(dueDate) >= new Date();
    }, "Due date must be in the future or today"),
    tags: z.string().max(200, "Tags are too long").optional(),
    members: z
      .array(
        z.object({
          user: z.string(),
          role: z.enum(["manager", "contributor", "viewer"]),
        })
      )
      .min(1, "At least one member is required")
      .max(50, "Too many project members"),
  })
  .refine((data) => {
    if (data.dueDate) {
      return new Date(data.dueDate) >= new Date(data.startDate);
    }
    return true;
  }, "Due date must be after or equal to start date");

const taskSchema = z.object({
  title: safeStringSchema("Task title", 200),
  description: z.string().max(2000, "Description is too long").optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: dateSchema.refine((date) => new Date(date) >= new Date(), {
    message: "Due date must be in the future or today",
  }),
  assignees: z
    .array(z.string())
    .min(1, "At least one assignee is required")
    .max(20, "Too many assignees"),
});

export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  emailSchemaObj as emailSchema,
  workspaceSchema,
  projectSchema,
  taskSchema,
  inviteMemberSchema,
  tokenSchema,
  passwordSchema,
  dateSchema,
  nameSchema,
  safeStringSchema,
};
