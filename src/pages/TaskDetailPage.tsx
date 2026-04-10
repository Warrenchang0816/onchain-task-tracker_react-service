import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getTask,
    submitTask,
    updateTask,
    cancelTask,
    acceptTask,
    approveTask,
    claimReward,
    type UpdateTaskPayload,
    type SubmitTaskPayload,
} from "../api/taskApi";
import { getAuthMe } from "../api/authApi";
import type { Task } from "../types/task";
import { useAccount } from "wagmi";

import AppButton from "../components/common/AppButton";
import AppModal from "../components/common/AppModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PageLoading from "../components/common/PageLoading";
import TaskForm from "../components/task/TaskForm";
import TaskSubmitModal from "../components/task/TaskSubmitModal";
import FundTaskButton from "../components/task/FundTaskButton";
import ClaimOnchainButton from "../components/task/ClaimOnchainButton";
import AppLayout from "../layouts/AppLayout";

type TaskActionType = "cancel" | "accept" | "approve" | "claim";

const PRIORITY_LABEL: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
};

const ONCHAIN_STATUS_LABEL: Record<string, string> = {
    NOT_FUNDED: "Not Funded",
    FUNDED: "Funded",
    ASSIGNED: "Assigned",
    APPROVED: "Approved",
    CLAIMED: "Claimed",
};

const TaskDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const [isActionDialogOpen, setIsActionDialogOpen] = useState<boolean>(false);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
    const [pendingActionType, setPendingActionType] = useState<TaskActionType | null>(null);

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

    const { address, isConnected } = useAccount();

    const canOperateTasks = Boolean(isAuthenticated && isConnected && address);

    const taskId = id ? parseInt(id, 10) : NaN;

    const loadTask = async () => {
        if (isNaN(taskId)) {
            setErrorMessage("Invalid task ID.");
            setIsLoading(false);
            return;
        }

        try {
            setErrorMessage("");
            setIsLoading(true);
            const data = await getTask(taskId);
            setTask(data);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to load task.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitial = async () => {
            if (isNaN(taskId)) {
                setErrorMessage("Invalid task ID.");
                setIsLoading(false);
                setIsAuthLoading(false);
                return;
            }

            await Promise.all([
                (async () => {
                    try {
                        setErrorMessage("");
                        setIsLoading(true);
                        const data = await getTask(taskId);
                        setTask(data);
                    } catch (error) {
                        setErrorMessage(
                            error instanceof Error ? error.message : "Failed to load task.",
                        );
                    } finally {
                        setIsLoading(false);
                    }
                })(),
                (async () => {
                    try {
                        setIsAuthLoading(true);
                        const authMe = await getAuthMe();
                        setIsAuthenticated(authMe.authenticated);
                    } catch {
                        setIsAuthenticated(false);
                    } finally {
                        setIsAuthLoading(false);
                    }
                })(),
            ]);
        };

        void fetchInitial();
    }, [taskId]);

    const openActionDialog = (actionType: TaskActionType) => {
        if (!canOperateTasks) return;
        setPendingActionType(actionType);
        setIsActionDialogOpen(true);
    };

    const closeActionDialog = () => {
        setPendingActionType(null);
        setIsActionDialogOpen(false);
        setIsActionLoading(false);
    };

    const handleActionConfirm = async () => {
        if (!task || !pendingActionType) return;

        try {
            setErrorMessage("");
            setIsActionLoading(true);

            if (pendingActionType === "cancel") {
                await cancelTask(task.id);
                setSuccessMessage("Task cancelled successfully.");
            } else if (pendingActionType === "accept") {
                await acceptTask(task.id);
                setSuccessMessage("Task accepted successfully.");
            } else if (pendingActionType === "approve") {
                await approveTask(task.id);
                setSuccessMessage("Task approved successfully.");
            } else if (pendingActionType === "claim") {
                await claimReward(task.id);
                setSuccessMessage("Reward claimed successfully.");
            }

            await loadTask();
            closeActionDialog();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to process action.",
            );
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditSubmit = async (payload: UpdateTaskPayload) => {
        if (!task) return;

        try {
            setErrorMessage("");
            await updateTask(task.id, payload as UpdateTaskPayload);
            setSuccessMessage("Task updated successfully.");
            setIsEditModalOpen(false);
            await loadTask();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to update task.",
            );
        }
    };

    const handleSubmitConfirm = async (payload: SubmitTaskPayload) => {
        if (!task) return;

        try {
            setErrorMessage("");
            await submitTask(task.id, payload);
            setSuccessMessage("Task submitted successfully.");
            setIsSubmitModalOpen(false);
            await loadTask();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to submit task.",
            );
        }
    };

    const actionDialogTitle =
        pendingActionType === "cancel" ? "Cancel Task"
        : pendingActionType === "accept" ? "Accept Task"
        : pendingActionType === "approve" ? "Approve Task"
        : "Claim Reward";

    const actionDialogDescription =
        pendingActionType === "cancel" ? "Are you sure you want to cancel this task?"
        : pendingActionType === "accept" ? "Are you sure you want to accept this task?"
        : pendingActionType === "approve" ? "Are you sure you want to approve this task?"
        : "Are you sure you want to claim this reward?";

    return (
        <AppLayout>
            <section className="page-section">
                <div style={{ marginBottom: 8 }}>
                    <AppButton
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/tasks")}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
                        Back to Tasks
                    </AppButton>
                </div>

                {successMessage && (
                    <div className="feedback-banner success-banner">
                        <p>{successMessage}</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="feedback-banner error-banner">
                        <p>{errorMessage}</p>
                    </div>
                )}

                {!isLoading && !isAuthLoading && task &&
                    task.status === "SUBMITTED" &&
                    task.isOwner &&
                    !task.canApprove &&
                    Number(task.rewardAmount) > 0 && (
                    <div className="feedback-banner warning-banner">
                        <p>
                            此任務有獎勵金（{task.rewardAmount} ETH），需完成以下步驟後才能 Approve：
                            {task.onchainStatus === "NOT_FUNDED" && " ① 點 Fund 完成鏈上付款 → ② 等待 Assignee 重新接受任務（鏈上 Assign）"}
                            {task.onchainStatus === "FUNDED" && " 等待 Assignee 重新接受任務（鏈上 Assign）"}
                        </p>
                    </div>
                )}

                {isLoading || isAuthLoading ? (
                    <PageLoading message="Loading task..." />
                ) : !task ? (
                    <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Task not found.</p>
                ) : (
                    <div className="task-detail-layout">
                        {/* Main content */}
                        <div className="task-detail-main">
                            {/* Title + badges */}
                            <div className="task-detail">
                                <div className="task-detail-header">
                                    <div className="task-detail-badges" style={{ marginBottom: 12 }}>
                                        <span className={`task-status ${task.status.toLowerCase().replace("_", "-")}`}>
                                            | {task.status.replace("_", " ")} |
                                        </span>
                                        <span className="task-onchain-badge">
                                            {ONCHAIN_STATUS_LABEL[task.onchainStatus] ?? task.onchainStatus}
                                        </span>
                                    </div>
                                    <h1>{task.title}</h1>
                                </div>

                                <div className="task-detail-body">
                                    {/* Description */}
                                    <div className="task-detail-description-block">
                                        <p className="task-detail-description-title">Task Specification</p>
                                        <p className="task-detail-description">{task.description}</p>
                                    </div>

                                    {/* Metadata grid */}
                                    <dl className="task-detail-meta-grid">
                                        <div className="task-detail-meta-cell">
                                            <dt>PRIORITY_LEVEL</dt>
                                            <dd>
                                                <span className={`task-priority task-priority--${task.priority.toLowerCase()}`}>
                                                    {PRIORITY_LABEL[task.priority] ?? task.priority}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="task-detail-meta-cell">
                                            <dt>TOTAL_REWARD</dt>
                                            <dd style={{ color: "var(--green-dim)", fontFamily: "var(--font-mono)" }}>
                                                {task.rewardAmount} ETH
                                            </dd>
                                        </div>
                                        <div className="task-detail-meta-cell">
                                            <dt>ORIGIN_PROTOCOL</dt>
                                            <dd className="task-detail-address">{task.walletAddress}</dd>
                                        </div>
                                        {task.assigneeWalletAddress && (
                                            <div className="task-detail-meta-cell">
                                                <dt>CURRENT_ASSIGNEE</dt>
                                                <dd className="task-detail-address">{task.assigneeWalletAddress}</dd>
                                            </div>
                                        )}
                                        {task.dueDate && (
                                            <div className="task-detail-meta-cell">
                                                <dt>DUE_DATE</dt>
                                                <dd>{new Date(task.dueDate).toLocaleDateString()}</dd>
                                            </div>
                                        )}
                                        <div className="task-detail-meta-cell">
                                            <dt>CREATED_AT</dt>
                                            <dd style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                                                {new Date(task.createdAt).toLocaleString()}
                                            </dd>
                                        </div>
                                    </dl>

                                    {/* TX Ledger */}
                                    {(task.fundTxHash || task.approveTxHash || task.claimTxHash || task.cancelTxHash) && (
                                        <div className="task-tx-ledger">
                                            <div className="task-tx-ledger-title">
                                                <span className="task-tx-ledger-title-bar" />
                                                TRANSACTION_LEDGER
                                            </div>
                                            {task.fundTxHash && (
                                                <div className="task-tx-row">
                                                    <span className="task-tx-label">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--cyan)" }}>deployed_code</span>
                                                        FUND_TX
                                                    </span>
                                                    <a
                                                        href={`https://sepolia.basescan.org/tx/${task.fundTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="task-tx-hash"
                                                    >
                                                        {task.fundTxHash.slice(0, 12)}…{task.fundTxHash.slice(-8)}
                                                    </a>
                                                </div>
                                            )}
                                            {task.approveTxHash && (
                                                <div className="task-tx-row">
                                                    <span className="task-tx-label">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--green-dim)" }}>verified</span>
                                                        APPROVE_TX
                                                    </span>
                                                    <a
                                                        href={`https://sepolia.basescan.org/tx/${task.approveTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="task-tx-hash"
                                                    >
                                                        {task.approveTxHash.slice(0, 12)}…{task.approveTxHash.slice(-8)}
                                                    </a>
                                                </div>
                                            )}
                                            {task.claimTxHash && (
                                                <div className="task-tx-row">
                                                    <span className="task-tx-label">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--purple)" }}>token</span>
                                                        CLAIM_TX
                                                    </span>
                                                    <a
                                                        href={`https://sepolia.basescan.org/tx/${task.claimTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="task-tx-hash"
                                                    >
                                                        {task.claimTxHash.slice(0, 12)}…{task.claimTxHash.slice(-8)}
                                                    </a>
                                                </div>
                                            )}
                                            {task.cancelTxHash && (
                                                <div className="task-tx-row">
                                                    <span className="task-tx-label">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--red)" }}>cancel</span>
                                                        CANCEL_TX
                                                    </span>
                                                    <span className="task-tx-hash">{task.cancelTxHash}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Panel Sidebar */}
                        {canOperateTasks && (
                            <aside className="task-detail-sidebar">
                                <div className="action-panel">
                                    <div className="action-panel-title">
                                        TERMINAL_ACTIONS
                                        <span className="action-panel-live">● LIVE</span>
                                    </div>

                                    <div className="action-panel-buttons">
                                        <FundTaskButton task={task} onSuccess={loadTask} />
                                        <ClaimOnchainButton task={task} onSuccess={loadTask} />

                                        {(task.canEdit || task.canCancel || task.canAccept || task.canSubmit || task.canApprove || (task.canClaim && !task.canClaimOnchain)) && (
                                            <div className="action-panel-divider" />
                                        )}

                                        <div className="action-panel-grid">
                                            {task.canEdit && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost"
                                                    onClick={() => setIsEditModalOpen(true)}
                                                >
                                                    EDIT
                                                </button>
                                            )}
                                            {task.canCancel && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost"
                                                    onClick={() => openActionDialog("cancel")}
                                                >
                                                    CANCEL
                                                </button>
                                            )}
                                            {task.canAccept && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost"
                                                    onClick={() => openActionDialog("accept")}
                                                >
                                                    ACCEPT
                                                </button>
                                            )}
                                            {task.canSubmit && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost"
                                                    onClick={() => setIsSubmitModalOpen(true)}
                                                >
                                                    SUBMIT
                                                </button>
                                            )}
                                            {task.canApprove && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost action-panel-btn-full"
                                                    onClick={() => openActionDialog("approve")}
                                                >
                                                    APPROVE_MILESTONE
                                                </button>
                                            )}
                                            {task.canClaim && !task.canClaimOnchain && (
                                                <button
                                                    type="button"
                                                    className="action-panel-btn-ghost action-panel-btn-full"
                                                    onClick={() => openActionDialog("claim")}
                                                >
                                                    CLAIM_REWARD
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                )}
            </section>

            <AppModal
                isOpen={isEditModalOpen}
                title="Edit Task"
                onClose={() => setIsEditModalOpen(false)}
            >
                <TaskForm
                    mode="edit"
                    initialTask={task}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </AppModal>

            <ConfirmDialog
                isOpen={isActionDialogOpen}
                title={actionDialogTitle}
                description={actionDialogDescription}
                confirmText={actionDialogTitle}
                cancelText="Back"
                isLoading={isActionLoading}
                onConfirm={handleActionConfirm}
                onCancel={closeActionDialog}
            />

            <TaskSubmitModal
                isOpen={isSubmitModalOpen}
                onSubmit={handleSubmitConfirm}
                onCancel={() => setIsSubmitModalOpen(false)}
            />
        </AppLayout>
    );
};

export default TaskDetailPage;
