import { Link } from "react-router-dom";
import type { Task } from "../../types/task";
import AppButton from "../common/AppButton";

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onAccept?: (task: Task) => void;
    onSubmit?: (task: Task) => void;
    onApprove?: (task: Task) => void;
    onClaim?: (task: Task) => void;
}

const STATUS_CLASS: Record<string, string> = {
    OPEN: "task-status open",
    IN_PROGRESS: "task-status in-progress",
    SUBMITTED: "task-status submitted",
    APPROVED: "task-status approved",
    COMPLETED: "task-status completed",
    CANCELLED: "task-status cancelled",
};

const CARD_STATUS_CLASS: Record<string, string> = {
    OPEN: "status-open",
    IN_PROGRESS: "status-in-progress",
    SUBMITTED: "status-submitted",
    APPROVED: "status-approved",
    COMPLETED: "status-completed",
    CANCELLED: "status-cancelled",
};

const PRIORITY_CLASS: Record<string, string> = {
    LOW: "priority-badge priority-low",
    MEDIUM: "priority-badge priority-medium",
    HIGH: "priority-badge priority-high",
    URGENT: "priority-badge priority-urgent",
};

const TaskCard = ({
    task,
    onEdit,
    onDelete,
    onAccept,
    onSubmit,
    onApprove,
    onClaim,
}: TaskCardProps) => {
    const shouldShowActions =
        (task.canEdit && onEdit) ||
        (task.canCancel && onDelete) ||
        (task.canAccept && onAccept) ||
        (task.canSubmit && onSubmit) ||
        (task.canApprove && onApprove) ||
        (task.canClaim && onClaim);

    const statusClass = STATUS_CLASS[task.status] ?? "task-status open";
    const cardClass = `task-card ${CARD_STATUS_CLASS[task.status] ?? ""}`;

    return (
        <div className={cardClass}>
            <div className="task-card-header">
                <div className="task-card-title">
                    <Link to={`/tasks/${task.id}`}>
                        {task.title}
                    </Link>
                </div>
                <div className="task-card-badges">
                    <span className={statusClass}>| {task.status.replace("_", " ")} |</span>
                </div>
            </div>

            {task.description && (
                <p className="task-card-description">{task.description}</p>
            )}

            <div className="task-card-meta">
                <span className={PRIORITY_CLASS[task.priority] ?? "priority-badge priority-low"}>
                    {task.priority}
                </span>
                {Number(task.rewardAmount) > 0 && (
                    <span className="task-card-meta-item">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>toll</span>
                        {task.rewardAmount} ETH
                    </span>
                )}
                {task.dueDate && (
                    <span className="task-card-meta-item">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
                <span className="task-onchain-badge">{task.onchainStatus}</span>
            </div>

            {shouldShowActions && (
                <div className="task-card-actions">
                    {task.canEdit && onEdit && (
                        <AppButton type="button" variant="secondary" onClick={() => onEdit(task)}>
                            Edit
                        </AppButton>
                    )}
                    {task.canCancel && onDelete && (
                        <AppButton type="button" variant="secondary" onClick={() => onDelete(task)}>
                            Cancel
                        </AppButton>
                    )}
                    {task.canAccept && onAccept && (
                        <AppButton type="button" onClick={() => onAccept(task)}>
                            Accept
                        </AppButton>
                    )}
                    {task.canSubmit && onSubmit && (
                        <AppButton type="button" onClick={() => onSubmit(task)}>
                            Submit
                        </AppButton>
                    )}
                    {task.canApprove && onApprove && (
                        <AppButton type="button" onClick={() => onApprove(task)}>
                            Approve
                        </AppButton>
                    )}
                    {task.canClaim && !task.canClaimOnchain && onClaim && (
                        <AppButton type="button" onClick={() => onClaim(task)}>
                            Claim
                        </AppButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
