import { getTodos } from "./actions";
import { TodoList } from "./components/todo-list";

export default async function TodosPage() {
  const result = await getTodos("all");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Todos</h1>
        <TodoList initialTodos={result.success ? result.data || [] : []} />
      </div>
    </div>
  );
}
