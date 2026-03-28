import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import TaskForm from "../components/task/TaskForm";
import { createTask, type CreateTaskPayload } from "../api/taskApi";

const TaskCreatePage = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (payload: CreateTaskPayload) => {
        setErrorMessage(null);
        try {
            await createTask(payload);
            navigate("/tasks");
        } catch {
            setErrorMessage("Failed to create task. Please try again.");
        }
    };

    const handleCancel = () => {
        navigate("/tasks");
    };

    return (
        <AppLayout>
            <section className="page-section">
                <div className="page-heading">
                    <h1>Create Task</h1>
                    <p>Define a new task that can later be recorded on-chain.</p>
                </div>

                {errorMessage && (
                    <div className="message error">{errorMessage}</div>
                )}

                <TaskForm
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </section>
        </AppLayout>
    );
};

export default TaskCreatePage;