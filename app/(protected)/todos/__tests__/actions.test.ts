import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../actions";

// Mock dependencies
vi.mock("@/lib/supabase/server");
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
};

describe("Todo Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTodo", () => {
    it("should create a todo successfully", async () => {
      // Mock authentication
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      // Mock database insert
      const mockTodo = {
        id: "todo-1",
        userId: mockUser.id,
        text: "Buy groceries",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTodo]),
        }),
      } as any);

      const result = await createTodo("Buy groceries");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodo);
      expect(result.error).toBeUndefined();
    });

    it("should fail if user is not authenticated", async () => {
      // Mock no user
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      const result = await createTodo("Buy groceries");

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to create a todo");
    });

    it("should fail if todo text is empty", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const result = await createTodo("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Todo text is required");
    });

    it("should fail if todo text is whitespace only", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const result = await createTodo("   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Todo text cannot be empty or whitespace only");
    });

    it("should fail if todo text exceeds max length", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const longText = "a".repeat(501);
      const result = await createTodo(longText);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Todo text must not exceed 500 characters");
    });
  });

  describe("getTodos", () => {
    it("should get all todos for authenticated user", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const mockTodos = [
        {
          id: "todo-1",
          userId: mockUser.id,
          text: "Buy groceries",
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "todo-2",
          userId: mockUser.id,
          text: "Do laundry",
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockTodos),
            }),
          }),
        }),
      } as any);

      const result = await getTodos("all");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodos);
    });

    it("should fail if user is not authenticated", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      const result = await getTodos();

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to view todos");
    });
  });

  describe("updateTodo", () => {
    it("should update todo text successfully", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const existingTodo = {
        id: "todo-1",
        userId: mockUser.id,
        text: "Buy groceries",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTodo = {
        ...existingTodo,
        text: "Buy milk",
        updatedAt: new Date(),
      };

      // Mock ownership check
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingTodo]),
          }),
        }),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedTodo]),
          }),
        }),
      } as any);

      const result = await updateTodo("todo-1", { text: "Buy milk" });

      expect(result.success).toBe(true);
      expect(result.data?.text).toBe("Buy milk");
    });

    it("should update todo completion status successfully", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const existingTodo = {
        id: "todo-1",
        userId: mockUser.id,
        text: "Buy groceries",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTodo = {
        ...existingTodo,
        completed: true,
        updatedAt: new Date(),
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingTodo]),
          }),
        }),
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedTodo]),
          }),
        }),
      } as any);

      const result = await updateTodo("todo-1", { completed: true });

      expect(result.success).toBe(true);
      expect(result.data?.completed).toBe(true);
    });

    it("should fail if user is not authenticated", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      const result = await updateTodo("todo-1", { text: "Buy milk" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to update a todo");
    });

    it("should fail if todo does not belong to user", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      // Mock no todo found
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await updateTodo("todo-1", { text: "Buy milk" });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Todo not found or you don't have permission to update it",
      );
    });
  });

  describe("deleteTodo", () => {
    it("should delete todo successfully", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      const deletedTodo = {
        id: "todo-1",
        userId: mockUser.id,
        text: "Buy groceries",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([deletedTodo]),
        }),
      } as any);

      const result = await deleteTodo("todo-1");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail if user is not authenticated", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      const result = await deleteTodo("todo-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to delete a todo");
    });

    it("should fail if todo does not belong to user", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      } as any);

      // Mock no todo deleted
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await deleteTodo("todo-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Todo not found or you don't have permission to delete it",
      );
    });
  });
});
