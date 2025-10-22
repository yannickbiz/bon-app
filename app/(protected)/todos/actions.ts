"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { validateTodoText } from "@/lib/todos/validation";
import type {
  Todo,
  TodoActionResult,
  TodoFilter,
  UpdateTodoInput,
} from "@/types/todos";

/**
 * Get the current authenticated user
 * Returns null if no user is authenticated
 */
async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Create a new todo
 */
export async function createTodo(
  text: string,
): Promise<TodoActionResult<Todo>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a todo",
      };
    }

    // Validate input
    const validation = validateTodoText(text);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Create todo in database
    const [newTodo] = await db
      .insert(todos)
      .values({
        userId: user.id,
        text: text.trim(),
        completed: false,
      })
      .returning();

    // Revalidate the todos page
    revalidatePath("/todos");

    return {
      success: true,
      data: {
        id: newTodo.id,
        userId: newTodo.userId,
        text: newTodo.text,
        completed: newTodo.completed,
        createdAt: newTodo.createdAt,
        updatedAt: newTodo.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    return {
      success: false,
      error: "Failed to create todo. Please try again.",
    };
  }
}

/**
 * Get todos for the current user with optional filtering
 */
export async function getTodos(
  filter: TodoFilter = "all",
): Promise<TodoActionResult<Todo[]>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to view todos",
      };
    }

    // Build query conditions
    const conditions = [eq(todos.userId, user.id)];

    if (filter === "active") {
      conditions.push(eq(todos.completed, false));
    } else if (filter === "completed") {
      conditions.push(eq(todos.completed, true));
    }

    // Fetch todos from database
    const userTodos = await db
      .select()
      .from(todos)
      .where(and(...conditions))
      .orderBy(desc(todos.createdAt))
      .limit(100); // Limit to 100 most recent todos

    return {
      success: true,
      data: userTodos.map((todo) => ({
        id: todo.id,
        userId: todo.userId,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      success: false,
      error: "Failed to fetch todos. Please try again.",
    };
  }
}

/**
 * Update a todo (text and/or completion status)
 */
export async function updateTodo(
  id: string,
  updates: UpdateTodoInput,
): Promise<TodoActionResult<Todo>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to update a todo",
      };
    }

    // Validate text if provided
    if (updates.text !== undefined) {
      const validation = validateTodoText(updates.text);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }
    }

    // Check ownership
    const [existingTodo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .limit(1);

    if (!existingTodo) {
      return {
        success: false,
        error: "Todo not found or you don't have permission to update it",
      };
    }

    // Build update object
    const updateData: {
      text?: string;
      completed?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (updates.text !== undefined) {
      updateData.text = updates.text.trim();
    }

    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }

    // Update todo in database
    const [updatedTodo] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    // Revalidate the todos page
    revalidatePath("/todos");

    return {
      success: true,
      data: {
        id: updatedTodo.id,
        userId: updatedTodo.userId,
        text: updatedTodo.text,
        completed: updatedTodo.completed,
        createdAt: updatedTodo.createdAt,
        updatedAt: updatedTodo.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    return {
      success: false,
      error: "Failed to update todo. Please try again.",
    };
  }
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: string): Promise<TodoActionResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to delete a todo",
      };
    }

    // Check ownership and delete
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Todo not found or you don't have permission to delete it",
      };
    }

    // Revalidate the todos page
    revalidatePath("/todos");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      success: false,
      error: "Failed to delete todo. Please try again.",
    };
  }
}
