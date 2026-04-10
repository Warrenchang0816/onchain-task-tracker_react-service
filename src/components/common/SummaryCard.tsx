interface SummaryCardProps {
    title: string;
    value: number;
    variant?: "default" | "total" | "open" | "done" | "success" | "info";
}

const LABEL_PREFIX: Record<string, string> = {
    default: "SYS",
    total: "NET",
    open: "ACT",
    done: "FIN",
    success: "FIN",
    info: "ACT",
};

const BAR_WIDTH: Record<string, string> = {
    default: "60%",
    total: "100%",
    open: "70%",
    done: "40%",
    success: "40%",
    info: "70%",
};

const SummaryCard = ({ title, value, variant = "default" }: SummaryCardProps) => {
    return (
        <div className={`summary-card summary-card--${variant} bracket-container`}>
            <span className="summary-card-label">
                {LABEL_PREFIX[variant] ?? "SYS"} / {title}
            </span>
            <div className="summary-card-value">{value.toLocaleString()}</div>
            <div className="summary-card-bar">
                <div className="summary-card-bar-fill" style={{ width: BAR_WIDTH[variant] ?? "60%" }} />
            </div>
        </div>
    );
};

export default SummaryCard;
