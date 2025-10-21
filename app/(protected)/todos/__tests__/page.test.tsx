import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "@/types/todos";
import * as actions from "../actions";
import TodosPage from "../page";

vi.mock("../actions");

describe("TodosPage", () => {
  it("should render page title", async () => {
    vi.mocked(actions.getTodos).mockResolvedValue({
      success: true,
      data: [],
    });

    const page = await TodosPage();
    render(page);

    expect(screen.getByText("My Todos")).toBeInTheDocument();
  });

  it("should load and display todos from server", async () => {
    const mockTodos: Todo[] = [
      {
        id: "todo-1",
        userId: "user-1",
        text: "Buy groceries",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "todo-2",
        userId: "user-1",
        text: "Do laundry",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(actions.getTodos).mockResolvedValue({
      success: true,
      data: mockTodos,
    });

    const page = await TodosPage();
    render(page);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Do laundry")).toBeInTheDocument();
  });

  it("should handle empty todos list", async () => {
    vi.mocked(actions.getTodos).mockResolvedValue({
      success: true,
      data: [],
    });

    const page = await TodosPage();
    render(page);

    expect(
      screen.getByText("No todos yet. Add one above to get started!"),
    ).toBeInTheDocument();
  });

  it("should handle server error gracefully", async () => {
    vi.mocked(actions.getTodos).mockResolvedValue({
      success: false,
      error: "Failed to load todos",
    });

    const page = await TodosPage();
    render(page);

    // Should render empty state when there's an error
    expect(
      screen.getByText("No todos yet. Add one above to get started!"),
    ).toBeInTheDocument();
  });

  it("should render TodoList with correct props", async () => {
    const mockTodos: Todo[] = [
      {
        id: "todo-1",
        userId: "user-1",
        text: "Test todo",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(actions.getTodos).mockResolvedValue({
      success: true,
      data: mockTodos,
    });

    const page = await TodosPage();
    render(page);

    // Verify TodoList is rendered with the data
    expect(screen.getByText("Test todo")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What needs to be done?"),
    ).toBeInTheDocument();
  });
});
