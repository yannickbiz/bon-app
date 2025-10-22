export type Todo = {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTodoInput = {
  text: string;
};

export type UpdateTodoInput = {
  text?: string;
  completed?: boolean;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodoActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
