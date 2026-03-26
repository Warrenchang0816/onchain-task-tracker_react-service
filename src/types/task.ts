export type TaskStatus = "CREATED" | "COMPLETED";

// export interface Task {
//     id: number;
//     title: string;
//     description: string;
//     status: TaskStatus;
//     createdAt: string;
//     completedAt?: string;
// }

export interface CreateTaskPayload {
    title: string;
    description: string;
}

export interface UpdateTaskPayload {
    title: string;
    description: string;
}

export type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskListResponse = {
  success: boolean;
  data: Task[];
  message: string;
};