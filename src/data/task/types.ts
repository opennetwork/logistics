export type TaskType =
    | "place"
    | "inventory"
    | "packing"
    | "picking"

export interface TaskData extends Record<string, unknown> {
  type: TaskType
  taskName?: string;
  address?: string[];
  countryCode?: string;
  organisationId?: string;
  userId?: string;
}

export interface Task extends TaskData {
  taskId: string;
  createdAt: string;
  updatedAt: string;
}
