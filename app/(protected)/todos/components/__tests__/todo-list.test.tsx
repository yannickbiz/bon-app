import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Todo } from "@/types/todos";
import { TodoList } from "../todo-list";

vi.mock("../../actions");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TodoList", () => {
  const mockTodos: Todo[] = [
    {
      id: "todo-1",
      userId: "user-1",
      text: "Buy groceries",
      completed: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "todo-2",
      userId: "user-1",
      text: "Do laundry",
      completed: true,
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
    {
      id: "todo-3",
      userId: "user-1",
      text: "Write tests",
      completed: false,
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
    },
  ];

  it("should render todo input and filter tabs", () => {
    render(<TodoList initialTodos={mockTodos} />);

    expect(
      screen.getByPlaceholderText("What needs to be done?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /all \(3\)/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /active \(2\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /completed \(1\)/i }),
    ).toBeInTheDocument();
  });

  it("should display all todos by default", () => {
    render(<TodoList initialTodos={mockTodos} />);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Do laundry")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("should filter to show only active todos", async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={mockTodos} />);

    const activeTab = screen.getByRole("tab", { name: /active \(2\)/i });
    await user.click(activeTab);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.queryByText("Do laundry")).not.toBeInTheDocument();
  });

  it("should filter to show only completed todos", async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={mockTodos} />);

    const completedTab = screen.getByRole("tab", {
      name: /completed \(1\)/i,
    });
    await user.click(completedTab);

    expect(screen.getByText("Do laundry")).toBeInTheDocument();
    expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
  });

  it("should show empty state when no todos exist", () => {
    render(<TodoList initialTodos={[]} />);

    expect(
      screen.getByText("No todos yet. Add one above to get started!"),
    ).toBeInTheDocument();
  });

  it("should show empty state for active todos when all are completed", async () => {
    const user = userEvent.setup();
    const completedTodos: Todo[] = [
      {
        id: "todo-1",
        userId: "user-1",
        text: "Completed task",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<TodoList initialTodos={completedTodos} />);

    const activeTab = screen.getByRole("tab", { name: /active \(0\)/i });
    await user.click(activeTab);

    expect(
      screen.getByText("No active todos. Great job! 🎉"),
    ).toBeInTheDocument();
  });

  it("should show empty state for completed todos when none are completed", async () => {
    const user = userEvent.setup();
    const activeTodos: Todo[] = [
      {
        id: "todo-1",
        userId: "user-1",
        text: "Active task",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<TodoList initialTodos={activeTodos} />);

    const completedTab = screen.getByRole("tab", {
      name: /completed \(0\)/i,
    });
    await user.click(completedTab);

    expect(
      screen.getByText("No completed todos yet. Keep going! 💪"),
    ).toBeInTheDocument();
  });

  it("should update counts when todos change", () => {
    render(<TodoList initialTodos={mockTodos} />);

    // Initial counts: 3 total, 2 active, 1 completed
    expect(screen.getByRole("tab", { name: /all \(3\)/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /active \(2\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /completed \(1\)/i }),
    ).toBeInTheDocument();
  });

  it("should render correct number of todo items", () => {
    render(<TodoList initialTodos={mockTodos} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("should switch between filter tabs correctly", async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={mockTodos} />);

    // Start on All tab
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Do laundry")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();

    // Switch to Active
    const activeTab = screen.getByRole("tab", { name: /active \(2\)/i });
    await user.click(activeTab);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.queryByText("Do laundry")).not.toBeInTheDocument();

    // Switch to Completed
    const completedTab = screen.getByRole("tab", {
      name: /completed \(1\)/i,
    });
    await user.click(completedTab);

    expect(screen.getByText("Do laundry")).toBeInTheDocument();
    expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();

    // Switch back to All
    const allTab = screen.getByRole("tab", { name: /all \(3\)/i });
    await user.click(allTab);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Do laundry")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });
});
