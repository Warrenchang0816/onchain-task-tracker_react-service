import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import AppButton from "../common/AppButton";
import { REWARD_VAULT_ADDRESS } from "../../lib/wallet/constants";
import { taskRewardVaultAbi } from "../../lib/wallet/abi/taskRewardVaultAbi";
import { toRewardValue, toTaskBytes32 } from "../../lib/wallet/taskOnchain";
import type { Task } from "../../types/task";

interface FundTaskButtonProps {
    task: Task;
    onSuccess?: () => Promise<void> | void;
}

const API_BASE_URL =
    import.meta.env.VITE_API_GO_SERVICE_URL ?? "http://localhost:8081/api";

const FundTaskButton = ({ task, onSuccess }: FundTaskButtonProps) => {
    const { address } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const syncedRef = useRef(false);

    const {
        isSuccess: isReceiptSuccess,
        isLoading: isWaitingReceipt,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const isProcessing = isPending || isWaitingReceipt;

    useEffect(() => {
        const syncFunded = async () => {
            if (!txHash || !isReceiptSuccess || syncedRef.current) {
                return;
            }

            syncedRef.current = true;

            try {
                const res = await fetch(
                    `${API_BASE_URL}/tasks/${task.id}/onchain/funded`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ txHash }),
                    },
                );

                if (!res.ok) {
                    const body = await res.text();
                    setErrorMessage(
                        `鏈上交易已成功（${txHash}），但 DB 同步失敗（${res.status}）：${body}。請截圖並聯繫管理員。`
                    );
                    return;
                }

                setErrorMessage("");
                setTxHash(undefined);
                await onSuccess?.();
            } catch (err) {
                setErrorMessage(
                    `鏈上交易已成功（${txHash}），但 DB 同步請求失敗：${
                        err instanceof Error ? err.message : String(err)
                    }。請截圖並聯繫管理員。`
                );
            }
        };

        void syncFunded();
    }, [txHash, isReceiptSuccess, task.id, onSuccess]);

    useEffect(() => {
        if (!isReceiptError) return;

        setErrorMessage(
            `交易已送出，但確認失敗：${
                receiptError instanceof Error ? receiptError.message : "unknown error"
            }`
        );
    }, [isReceiptError, receiptError]);

    if (!isAddress(REWARD_VAULT_ADDRESS)) {
        return null;
    }

    if (!task.canFund) {
        return null;
    }

    const handleFund = async () => {
        if (!address) {
            setErrorMessage("請先連接錢包。");
            return;
        }

        try {
            setErrorMessage("");
            syncedRef.current = false;
            setTxHash(undefined);

            const hash = await writeContractAsync({
                address: REWARD_VAULT_ADDRESS as `0x${string}`,
                abi: taskRewardVaultAbi,
                functionName: "createAndFundTask",
                args: [toTaskBytes32(task.taskId), address],
                value: toRewardValue(task.rewardAmount),
            });

            setTxHash(hash);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Transaction failed.";
            const normalized = msg.toLowerCase();

            if (
                normalized.includes("user rejected") ||
                normalized.includes("user denied") ||
                normalized.includes("rejected the request")
            ) {
                setErrorMessage("你已取消交易。");
                return;
            }

            if (normalized.includes("task exists")) {
                setErrorMessage("合約已收到此任務的資金，但 DB 尚未同步。請聯繫管理員手動更新 onchain_status。");
                return;
            }

            setErrorMessage(msg);
        }
    };

    return (
        <div className="onchain-button-wrapper">
            {errorMessage && <p className="form-error">{errorMessage}</p>}
            <AppButton
                type="button"
                onClick={handleFund}
                disabled={!address || isProcessing}
            >
                {isProcessing ? "..." : "Fund"}
            </AppButton>
        </div>
    );
};

export default FundTaskButton;