import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { getBlockchainLogs, type BlockchainLog } from "../api/taskApi";

const ACTION_LABELS: Record<string, string> = {
    FUND: "Fund",
    ASSIGN_WORKER: "Assign Worker",
    APPROVE_TASK: "Approve",
    CLAIM_REWARD: "Claim Reward",
};

const BlockchainLogsPage = () => {
    const [logs, setLogs] = useState<BlockchainLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getBlockchainLogs()
            .then(setLogs)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout>
            <div className="page-container">
                <div className="page-header">
                    <h2>Transaction History</h2>
                    <p style={{ color: "#6b7280", marginTop: "4px" }}>
                        All on-chain transactions recorded by the platform
                    </p>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "#dc2626" }}>{error}</p>}

                {!loading && !error && logs.length === 0 && (
                    <p style={{ color: "#6b7280" }}>No transactions recorded yet.</p>
                )}

                {!loading && logs.length > 0 && (
                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Task ID</th>
                                    <th>Action</th>
                                    <th>Tx Hash</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="logs-td-time">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="logs-td-taskid" title={log.taskId}>
                                            {log.taskId}
                                        </td>
                                        <td>
                                            <span className={`log-action-badge log-action-${log.action.toLowerCase().replace(/_/g, "-")}`}>
                                                {ACTION_LABELS[log.action] ?? log.action}
                                            </span>
                                        </td>
                                        <td className="logs-td-hash">
                                            <a
                                                href={`https://sepolia.basescan.org/tx/${log.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="tx-hash-link"
                                                title={log.txHash}
                                            >
                                                {log.txHash.slice(0, 10)}…{log.txHash.slice(-8)}
                                            </a>
                                        </td>
                                        <td>
                                            <span className={`log-status-badge log-status-${log.status.toLowerCase()}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default BlockchainLogsPage;
