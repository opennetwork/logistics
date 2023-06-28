import { Task, TaskData } from "./types";
import { getTaskStore } from "./store";

export async function setTask(
  data: TaskData & Pick<Task, "taskId"> & Partial<Task>
): Promise<Task> {
  const store = await getTaskStore();
  const updatedAt = new Date().toISOString();
  const document: Task = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    updatedAt,
  };
  await store.set(data.taskId, document);
  return document;
}