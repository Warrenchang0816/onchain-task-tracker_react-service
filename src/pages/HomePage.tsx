import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentTasks, getTaskSummary } from "../api/dashboardApi";
import { getTasks } from "../api/taskApi";
import AppButton from "../components/common/AppButton";
import EmptyState from "../components/common/EmptyState";
import PageLoading from "../components/common/PageLoading";
import SummaryCard from "../components/common/SummaryCard";
import TaskCard from "../components/task/TaskCard";
import AppLayout from "../layouts/AppLayout";
import type { Task } from "../types/task";

const HomePage = () => {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await getTasks();
                setTasks(data);
            } finally {
                setIsLoading(false);
            }
        };

        void loadTasks();
    }, []);

    const summary = getTaskSummary(tasks);
    const recentTasks = getRecentTasks(tasks, 3);

    return (
        <AppLayout>
            {/* Hero */}
            <section className="hero-section">
                <div className="hero-hex-bg" />
                <div className="hero-fade" />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Protocol Status: Operational
                    </div>

                    <h1 className="hero-title">
                        Manage Your<br />On-Chain Tasks
                    </h1>

                    <p className="hero-sub">
                        Powered by <strong>Base L2</strong> · Smart Contract Verified ·{" "}
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--green-dim)" }}>USDC REWARDS</span>
                    </p>

                    <div className="hero-actions">
                        <AppButton type="button" onClick={() => navigate("/tasks")}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
                            View Tasks
                        </AppButton>

                        <AppButton type="button" variant="secondary" onClick={() => navigate("/nft-tasks")}>
                            NFT Tasks
                        </AppButton>

                        <AppButton type="button" variant="secondary" onClick={() => navigate("/marketplace")}>
                            Marketplace
                        </AppButton>
                    </div>
                </div>
            </section>

            {/* Stats */}
            {isLoading ? (
                <PageLoading message="Loading dashboard..." />
            ) : (
                <>
                    <section className="summary-section">
                        <SummaryCard title="Total Tasks" value={summary.total} variant="default" />
                        <SummaryCard title="Completed" value={summary.completed} variant="success" />
                        <SummaryCard title="Pending" value={summary.pending} variant="info" />
                    </section>

                    {/* Recent Tasks */}
                    <section className="page-section dashboard-section">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Live Ledger Stream</h2>
                                <p className="section-subtitle">Real-Time Data Feed // Base Mainnet</p>
                            </div>
                            <AppButton
                                type="button"
                                variant="secondary"
                                onClick={() => navigate("/tasks")}
                                style={{ fontSize: 11 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>terminal</span>
                                Expand Terminal
                            </AppButton>
                        </div>

                        {recentTasks.length === 0 ? (
                            <EmptyState
                                title="No recent tasks"
                                description="Create a task to see it appear on your dashboard."
                            />
                        ) : (
                            <div className="task-list">
                                {recentTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </AppLayout>
    );
};

export default HomePage;
