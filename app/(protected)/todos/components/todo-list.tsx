"use client";

import { CheckCircle2, Circle, ListTodo } from "lucide-react";
import { useOptimistic, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Todo, TodoFilter } from "@/types/todos";
import { TodoInput } from "./todo-input";
import { TodoItem } from "./todo-item";

type TodoListProps = {
  initialTodos: Todo[];
};

export function TodoList({ initialTodos }: TodoListProps) {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    initialTodos,
    (state: Todo[], action: { type: string; todo?: Todo; id?: string }) => {
      switch (action.type) {
        case "add":
          return action.todo ? [action.todo, ...state] : state;
        case "update":
          return action.todo
            ? state.map((t) => (t.id === action.todo?.id ? action.todo : t))
            : state;
        case "delete":
          return state.filter((t) => t.id !== action.id);
        default:
          return state;
      }
    },
  );

  const handleTodoAdded = (todo: Todo) => {
    setOptimisticTodos({ type: "add", todo });
  };

  const handleTodoUpdated = (todo: Todo) => {
    setOptimisticTodos({ type: "update", todo });
  };

  const handleTodoDeleted = (id: string) => {
    setOptimisticTodos({ type: "delete", id });
  };

  const filteredTodos = optimisticTodos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTodosCount = optimisticTodos.filter((t) => !t.completed).length;
  const completedTodosCount = optimisticTodos.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <TodoInput onTodoAdded={handleTodoAdded} />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as TodoFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            All ({optimisticTodos.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            Active ({activeTodosCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completedTodosCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {filteredTodos.length === 0 ? (
            <EmptyState message="No todos yet. Add one above to get started!" />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTodoUpdated={handleTodoUpdated}
                onTodoDeleted={handleTodoDeleted}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-6">
          {filteredTodos.length === 0 ? (
            <EmptyState message="No active todos. Great job! 🎉" />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTodoUpdated={handleTodoUpdated}
                onTodoDeleted={handleTodoDeleted}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-6">
          {filteredTodos.length === 0 ? (
            <EmptyState message="No completed todos yet. Keep going! 💪" />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTodoUpdated={handleTodoUpdated}
                onTodoDeleted={handleTodoDeleted}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function TodoListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
