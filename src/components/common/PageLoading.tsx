interface PageLoadingProps {
    message?: string;
}

const PageLoading = ({ message = "Loading..." }: PageLoadingProps) => {
    return (
        <div className="page-loading">
            <div className="page-loading-spinner" />
            <span className="page-loading-text">{message}</span>
        </div>
    );
};

export default PageLoading;