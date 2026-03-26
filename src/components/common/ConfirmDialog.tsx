import AppButton from "./AppButton";
import AppModal from "./AppModal";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    return (
        <AppModal isOpen={isOpen} title={title} onClose={onCancel}>
            <div className="confirm-dialog">
                <p>{description}</p>

                <div className="confirm-dialog-actions">
                    <AppButton type="button" variant="secondary" onClick={onCancel}>
                        {cancelText}
                    </AppButton>

                    <AppButton type="button" onClick={onConfirm}>
                        {confirmText}
                    </AppButton>
                </div>
            </div>
        </AppModal>
    );
};

export default ConfirmDialog;