import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    getTasks,
    createTask,
    updateTask,
    archiveTask,
    type CreateTaskPayload,
    type UpdateTaskPayload,
} from "../api/taskApi";
import type { Task } from "../types/task";

import AppButton from "../components/common/AppButton";
import AppModal from "../components/common/AppModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import FilterTabs from "../components/common/FilterTabs";
import PageLoading from "../components/common/PageLoading";
import TaskCard from "../components/task/TaskCard";
import TaskForm from "../components/task/TaskForm";
import AppLayout from "../layouts/AppLayout";

interface TaskListPageState {
    successMessage?: string;
}

type TaskFilter = "ALL" | "COMPLETED" | "CREATED";
type TaskModalMode = "create" | "edit";

const TASK_FILTER_OPTIONS: { label: string; value: TaskFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending", value: "CREATED" },
];

const TaskListPage = () => {
    const location = useLocation();
    const pageState = location.state as TaskListPageState | null;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<TaskFilter>("ALL");
    const [successMessage, setSuccessMessage] = useState<string>(
        pageState?.successMessage ?? "",
    );
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
    const [taskModalMode, setTaskModalMode] = useState<TaskModalMode>("create");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);

    const loadTasks = async () => {
        try {
            setErrorMessage("");
            setIsLoading(true);

            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to load tasks.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadTasks();
    }, []);

    const filteredTasks = useMemo(() => {
        if (filter === "ALL") {
            return tasks;
        }

        return tasks.filter((task) => task.status === filter);
    }, [tasks, filter]);

    const openCreateModal = () => {
        setTaskModalMode("create");
        setSelectedTask(null);
        setIsTaskModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setTaskModalMode("edit");
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };

    const openDeleteDialog = (task: Task) => {
        setTaskPendingDelete(task);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setTaskPendingDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const handleTaskSubmit = async (
        payload: CreateTaskPayload | UpdateTaskPayload,
    ) => {
        try {
            setErrorMessage("");

            if (taskModalMode === "create") {
                await createTask(payload as CreateTaskPayload);
                await loadTasks();
                setSuccessMessage("Task created successfully.");
                closeTaskModal();
                return;
            }

            if (!selectedTask) {
                return;
            }

            await updateTask(selectedTask.id, payload as UpdateTaskPayload);
            await loadTasks();
            setSuccessMessage("Task updated successfully.");
            closeTaskModal();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to submit task.",
            );
        }
    };

    const handleDeleteConfirm = async () => {
        if (!taskPendingDelete) {
            return;
        }

        try {
            setErrorMessage("");

            await archiveTask(taskPendingDelete.id);
            await loadTasks();
            setSuccessMessage("Task archived successfully.");
            closeDeleteDialog();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to archive task.",
            );
        }
    };

    return (
        <AppLayout>
            <section className="page-section">
                <div className="page-heading page-heading-row">
                    <div>
                        <h1>Tasks</h1>
                        <p>Review your current on-chain task records.</p>
                    </div>

                    <AppButton type="button" onClick={openCreateModal}>
                        Create Task
                    </AppButton>
                </div>

                {successMessage ? (
                    <div className="feedback-banner success-banner">
                        <p>{successMessage}</p>
                    </div>
                ) : null}

                {errorMessage ? (
                    <div className="feedback-banner error-banner">
                        <p>{errorMessage}</p>
                    </div>
                ) : null}

                <FilterTabs
                    options={TASK_FILTER_OPTIONS}
                    value={filter}
                    onChange={setFilter}
                />

                {isLoading ? (
                    <PageLoading message="Loading tasks..." />
                ) : filteredTasks.length === 0 ? (
                    <EmptyState
                        title="No matching tasks"
                        description="Try another filter or create a new task."
                    />
                ) : (
                    <div className="task-list">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={openEditModal}
                                onDelete={openDeleteDialog}
                            />
                        ))}
                    </div>
                )}
            </section>

            <AppModal
                isOpen={isTaskModalOpen}
                title={taskModalMode === "create" ? "Create Task" : "Edit Task"}
                onClose={closeTaskModal}
            >
                <TaskForm
                    mode={taskModalMode}
                    initialTask={selectedTask}
                    onSubmit={handleTaskSubmit}
                    onCancel={closeTaskModal}
                />
            </AppModal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Archive Task"
                description="Are you sure you want to archive this task?"
                confirmText="Archive"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={closeDeleteDialog}
            />
        </AppLayout>
    );
};

export default TaskListPage;