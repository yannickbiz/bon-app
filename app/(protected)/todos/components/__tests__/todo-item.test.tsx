import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "@/types/todos";
import * as actions from "../../actions";
import { TodoItem } from "../todo-item";

vi.mock("../../actions");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TodoItem", () => {
  const mockTodo: Todo = {
    id: "todo-1",
    userId: "user-1",
    text: "Buy groceries",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnTodoUpdated = vi.fn();
  const mockOnTodoDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render todo text and action buttons", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2); // Edit and Delete buttons
  });

  it("should show strikethrough for completed todos", () => {
    const completedTodo = { ...mockTodo, completed: true };

    render(
      <TodoItem
        todo={completedTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const text = screen.getByText("Buy groceries");
    expect(text).toHaveClass("line-through");
    expect(text).toHaveClass("text-muted-foreground");
  });

  it("should toggle todo completion when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const updatedTodo = { ...mockTodo, completed: true };

    vi.mocked(actions.updateTodo).mockResolvedValue({
      success: true,
      data: updatedTodo,
    });

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(actions.updateTodo).toHaveBeenCalledWith("todo-1", {
        completed: true,
      });
      expect(mockOnTodoUpdated).toHaveBeenCalledWith(updatedTodo);
    });
  });

  it("should open edit dialog when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons[0]; // First button is edit

    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Todo")).toBeInTheDocument();
      expect(screen.getByLabelText("Todo Text")).toBeInTheDocument();
    });
  });

  it("should update todo text when edit is saved", async () => {
    const user = userEvent.setup();
    const updatedTodo = { ...mockTodo, text: "Buy milk" };

    vi.mocked(actions.updateTodo).mockResolvedValue({
      success: true,
      data: updatedTodo,
    });

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons[0];

    await user.click(editButton);

    const input = screen.getByLabelText("Todo Text");
    await user.clear(input);
    await user.type(input, "Buy milk");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(actions.updateTodo).toHaveBeenCalledWith("todo-1", {
        text: "Buy milk",
      });
      expect(mockOnTodoUpdated).toHaveBeenCalledWith(updatedTodo);
    });
  });

  it("should open delete confirmation when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons[1]; // Second button is delete

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Todo")).toBeInTheDocument();
      expect(
        screen.getByText(/are you sure you want to delete this todo/i),
      ).toBeInTheDocument();
    });
  });

  it("should delete todo when confirmed", async () => {
    const user = userEvent.setup();

    vi.mocked(actions.deleteTodo).mockResolvedValue({
      success: true,
    });

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons[1];

    await user.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /^delete$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteTodo).toHaveBeenCalledWith("todo-1");
      expect(mockOnTodoDeleted).toHaveBeenCalledWith("todo-1");
    });
  });

  it("should show error toast when update fails", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    vi.mocked(actions.updateTodo).mockResolvedValue({
      success: false,
      error: "Failed to update todo",
    });

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update todo");
    });

    expect(mockOnTodoUpdated).not.toHaveBeenCalled();
  });

  it("should show error toast when delete fails", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    vi.mocked(actions.deleteTodo).mockResolvedValue({
      success: false,
      error: "Failed to delete todo",
    });

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons[1];

    await user.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /^delete$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete todo");
    });

    expect(mockOnTodoDeleted).not.toHaveBeenCalled();
  });

  it("should cancel edit when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons[0];

    await user.click(editButton);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Edit Todo")).not.toBeInTheDocument();
    });

    expect(actions.updateTodo).not.toHaveBeenCalled();
  });

  it("should validate empty text in edit dialog", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(
      <TodoItem
        todo={mockTodo}
        onTodoUpdated={mockOnTodoUpdated}
        onTodoDeleted={mockOnTodoDeleted}
      />,
    );

    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons[0];

    await user.click(editButton);

    const input = screen.getByLabelText("Todo Text");
    await user.clear(input);

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Todo text cannot be empty");
    });

    expect(actions.updateTodo).not.toHaveBeenCalled();
  });
});
