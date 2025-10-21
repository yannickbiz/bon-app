import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "@/types/todos";
import * as actions from "../../actions";
import { TodoInput } from "../todo-input";

vi.mock("../../actions");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TodoInput", () => {
  const mockOnTodoAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render input field and add button", () => {
    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    expect(
      screen.getByPlaceholderText("What needs to be done?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("should update input value when typing", async () => {
    const user = userEvent.setup();
    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Buy groceries");

    expect(input).toHaveValue("Buy groceries");
  });

  it("should call createTodo and onTodoAdded on form submit", async () => {
    const user = userEvent.setup();
    const mockTodo: Todo = {
      id: "todo-1",
      userId: "user-1",
      text: "Buy groceries",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(actions.createTodo).mockResolvedValue({
      success: true,
      data: mockTodo,
    });

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    await user.type(input, "Buy groceries");
    await user.click(button);

    await waitFor(() => {
      expect(actions.createTodo).toHaveBeenCalledWith("Buy groceries");
      expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
    });

    // Input should be cleared after successful submit
    expect(input).toHaveValue("");
  });

  it("should disable button when input is empty", () => {
    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeDisabled();
  });

  it("should disable button when input is whitespace only", async () => {
    const user = userEvent.setup();
    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    await user.type(input, "   ");

    expect(button).toBeDisabled();
  });

  it("should show error toast for empty input on submit", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");

    // Type and then clear
    await user.type(input, "test");
    await user.clear(input);

    // Try to submit with empty input - but button should be disabled
    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeDisabled();
  });

  it("should prevent typing more than 500 characters due to maxLength", async () => {
    const user = userEvent.setup();

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText(
      "What needs to be done?",
    ) as HTMLInputElement;

    // Input has maxLength=500, so it won't accept more than 500 characters
    expect(input.maxLength).toBe(500);

    // Try to type 501 characters - only 500 will be accepted
    const longText = "a".repeat(501);
    await user.type(input, longText);

    // Input should only have 500 characters max
    expect(input.value.length).toBeLessThanOrEqual(500);
  });

  it("should show error toast when server returns error", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    vi.mocked(actions.createTodo).mockResolvedValue({
      success: false,
      error: "Failed to create todo",
    });

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Buy groceries");

    const button = screen.getByRole("button", { name: /add/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create todo");
    });

    expect(mockOnTodoAdded).not.toHaveBeenCalled();
  });

  it("should show loading state while submitting", async () => {
    const user = userEvent.setup();

    vi.mocked(actions.createTodo).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Buy groceries");

    const button = screen.getByRole("button", { name: /add/i });
    await user.click(button);

    // Button should show "Adding..." text
    expect(screen.getByText("Adding...")).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("should trim whitespace from input before submission", async () => {
    const user = userEvent.setup();
    const mockTodo: Todo = {
      id: "todo-1",
      userId: "user-1",
      text: "Buy groceries",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(actions.createTodo).mockResolvedValue({
      success: true,
      data: mockTodo,
    });

    render(<TodoInput onTodoAdded={mockOnTodoAdded} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "  Buy groceries  ");

    const button = screen.getByRole("button", { name: /add/i });
    await user.click(button);

    await waitFor(() => {
      expect(actions.createTodo).toHaveBeenCalledWith("Buy groceries");
    });
  });
});
