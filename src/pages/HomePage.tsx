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
            <section className="hero-section">
                <div className="hero-hex-bg" />
                <div className="hero-fade" />
                <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Protocol Status: Operational
                    </div>
                    <h1 className="hero-title">
                        Manage Your<br />On-Chain Tasks
                    </h1>
                    <p className="hero-subtitle">
                        建立任務、追蹤完成狀態，並完成鏈上獎勵結算。<br />
                        Decentralized. Transparent. On-chain.
                    </p>
                    <div className="hero-actions">
                        <AppButton type="button" onClick={() => navigate("/tasks")}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
                            Launch Tasks
                        </AppButton>
                        <AppButton type="button" variant="secondary" onClick={() => navigate("/logs")}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
                            History
                        </AppButton>
                    </div>
                </div>
            </section>

            {isLoading ? (
                <PageLoading message="Loading dashboard..." />
            ) : (
                <section className="page-section">
                    <div className="summary-cards">
                        <SummaryCard title="Total Tasks" value={summary.total} variant="total" />
                        <SummaryCard title="Active Tasks" value={summary.pending} variant="open" />
                        <SummaryCard title="Completed" value={summary.completed} variant="done" />
                    </div>

                    <div className="section-header">
                        <h2>
                            Live Ledger Stream
                        </h2>
                        <AppButton type="button" variant="secondary" onClick={() => navigate("/tasks")}>
                            View All
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
            )}
        </AppLayout>
    );
};

export default HomePage;
