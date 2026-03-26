import { useEffect, useState } from "react";
import type { Task } from "../../types/task";
import type {
    CreateTaskPayload,
    UpdateTaskPayload,
} from "../../api/taskApi";
import AppButton from "../common/AppButton";

type TaskFormMode = "create" | "edit";

interface TaskFormProps {
    mode: TaskFormMode;
    initialTask?: Task | null;
    onSubmit: (
        payload: CreateTaskPayload | UpdateTaskPayload,
    ) => Promise<void>;
    onCancel: () => void;
}

interface TaskFormValues {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
}

const defaultFormValues: TaskFormValues = {
    title: "",
    description: "",
    status: "CREATED",
    priority: "MEDIUM",
    dueDate: "",
};

const TaskForm = ({
    mode,
    initialTask,
    onSubmit,
    onCancel,
}: TaskFormProps) => {
    const [formValues, setFormValues] = useState<TaskFormValues>(defaultFormValues);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (mode === "edit" && initialTask) {
            setFormValues({
                title: initialTask.title ?? "",
                description: initialTask.description ?? "",
                status: initialTask.status ?? "CREATED",
                priority: initialTask.priority ?? "MEDIUM",
                dueDate: initialTask.dueDate
                    ? initialTask.dueDate.slice(0, 16)
                    : "",
            });
            return;
        }

        setFormValues(defaultFormValues);
    }, [mode, initialTask]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSubmitting(true);

        try {
            const payload: CreateTaskPayload | UpdateTaskPayload = {
                title: formValues.title.trim(),
                description: formValues.description.trim(),
                status: formValues.status,
                priority: formValues.priority,
                dueDate: formValues.dueDate
                    ? new Date(formValues.dueDate).toISOString()
                    : null,
            };

            await onSubmit(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    value={formValues.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    rows={4}
                />
            </div>

            <div className="form-field">
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formValues.status}
                    onChange={handleChange}
                >
                    <option value="CREATED">Created</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="priority">Priority</label>
                <select
                    id="priority"
                    name="priority"
                    value={formValues.priority}
                    onChange={handleChange}
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="dueDate">Due Date</label>
                <input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    value={formValues.dueDate}
                    onChange={handleChange}
                />
            </div>

            <div className="form-actions">
                <AppButton type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </AppButton>

                <AppButton type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Submitting..."
                        : mode === "create"
                            ? "Create Task"
                            : "Save Changes"}
                </AppButton>
            </div>
        </form>
    );
};

export default TaskForm;