import type { Task } from "../../types/task";
import AppButton from "../common/AppButton";

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
    return (
        <div className="task-card">
            <div className="task-card-header">
                <h3>{task.title}</h3>
                <span
                    className={
                        task.status === "COMPLETED"
                            ? "task-status completed"
                            : "task-status created"
                    }
                >
                    {task.status}
                </span>
            </div>

            <p>{task.description}</p>

            {(onEdit || onDelete) && (
                <div className="task-card-actions">
                    {onEdit && (
                        <AppButton
                            type="button"
                            variant="secondary"
                            onClick={() => onEdit(task)}
                        >
                            Edit
                        </AppButton>
                    )}
                    {onDelete && (
                        <AppButton
                            type="button"
                            variant="secondary"
                            onClick={() => onDelete(task)}
                        >
                            Delete
                        </AppButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
