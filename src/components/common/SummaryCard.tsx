interface SummaryCardProps {
    title: string;
    value: number;
    variant?: "default" | "success" | "info";
}

const BAR_WIDTH: Record<string, string> = {
    default: "66%",
    success: "100%",
    info: "33%",
};

const LABEL_PREFIX: Record<string, string> = {
    default: "System.Log",
    success: "Protocol.Success",
    info: "Mempool.Queue",
};

const SummaryCard = ({ title, value, variant = "default" }: SummaryCardProps) => {
    return (
        <div className={`summary-card summary-card--${variant} bracket-container`}>
            <span className="summary-card-label">
                {LABEL_PREFIX[variant]} / {title}
            </span>
            <div className="summary-card-value">{value.toLocaleString()}</div>
            <div className="summary-card-bar">
                <div
                    className="summary-card-bar-fill"
                    style={{ width: BAR_WIDTH[variant] }}
                />
            </div>
        </div>
    );
};

export default SummaryCard;
