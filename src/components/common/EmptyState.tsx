interface EmptyStateProps {
    title: string;
    description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--text-dim)", opacity: 0.4 }}>inbox</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

export default EmptyState;