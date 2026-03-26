// import { mockTasks } from "../mocks/tasks";
// import type { CreateTaskPayload, Task, UpdateTaskPayload } from "../types/task";

// export const fetchTasks = async (): Promise<Task[]> => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve([...mockTasks]);
//         }, 400);
//     });
// };

// export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             const newTask: Task = {
//                 id: mockTasks.length > 0 ? Math.max(...mockTasks.map((task) => task.id)) + 1 : 1,
//                 title: payload.title,
//                 description: payload.description,
//                 status: "CREATED",
//                 createdAt: new Date().toISOString(),
//             };

//             mockTasks.unshift(newTask);
//             resolve(newTask);
//         }, 400);
//     });
// };

// export const updateTask = async (
//     taskId: number,
//     payload: UpdateTaskPayload,
// ): Promise<Task | null> => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             const target = mockTasks.find((task) => task.id === taskId);

//             if (!target) {
//                 resolve(null);
//                 return;
//             }

//             target.title = payload.title;
//             target.description = payload.description;

//             resolve({ ...target });
//         }, 400);
//     });
// };

// export const deleteTask = async (taskId: number): Promise<void> => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             const index = mockTasks.findIndex((task) => task.id === taskId);

//             if (index !== -1) {
//                 mockTasks.splice(index, 1);
//             }

//             resolve();
//         }, 300);
//     });
// };



import type { Task, TaskListResponse } from "../types/task";

const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

export type CreateTaskPayload = {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string | null;
};

export type UpdateTaskPayload = {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string | null;
};

export async function getTasks(): Promise<Task[]> {
const response = await fetch(`${API_BASE_URL}/tasks`, {
method: "GET",
});

if (!response.ok) {
throw new Error(`Failed to fetch tasks: ${response.status}`);
}

const result: TaskListResponse = await response.json();

if (!result.success) {
throw new Error(result.message || "Failed to fetch tasks");
}

return result.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    });

    if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`);
    }
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
    }
}

export async function archiveTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: "archived",
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to archive task: ${response.status}`);
    }
}
