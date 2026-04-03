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

const FundTaskButton = ({ task, onSuccess }: FundTaskButtonProps) => {
    const { address } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const syncedRef = useRef(false);

    const { isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    useEffect(() => {
        const syncFunded = async () => {
            if (!txHash || !isReceiptSuccess || syncedRef.current) {
                return;
            }

            syncedRef.current = true;

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_GO_SERVICE_URL}/tasks/${task.id}/onchain/funded`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ txHash }),
                    },
                );

                if (!res.ok) {
                    const body = await res.text();
                    setErrorMessage(`鏈上交易已成功（${txHash}），但 DB 同步失敗（${res.status}）：${body}。請截圖並聯繫管理員。`);
                    return;
                }

                await onSuccess?.();
            } catch (err) {
                setErrorMessage(`鏈上交易已成功（${txHash}），但 DB 同步請求失敗：${err instanceof Error ? err.message : String(err)}。請截圖並聯繫管理員。`);
            }
        };

        void syncFunded();
    }, [txHash, isReceiptSuccess, task.id, onSuccess]);

    // Vault contract not configured — hide silently
    if (!isAddress(REWARD_VAULT_ADDRESS)) {
        return null;
    }

    // Backend controls visibility: only show when canFund is true
    if (!task.canFund) {
        return null;
    }

    const handleFund = async () => {
        if (!address) return;

        try {
            setErrorMessage("");
            syncedRef.current = false;

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
            // "task exists" means tx landed on-chain but DB sync failed previously
            if (msg.includes("task exists")) {
                setErrorMessage("合約已收到此任務的資金，但 DB 尚未同步。請聯繫管理員手動更新 onchain_status。");
            } else {
                setErrorMessage(msg);
            }
        }
    };

    return (
        <div className="onchain-button-wrapper">
            {errorMessage && <p className="form-error">{errorMessage}</p>}
            <AppButton
                type="button"
                onClick={handleFund}
                disabled={!address || isPending}
            >
                {isPending ? "Funding..." : "Fund"}
            </AppButton>
        </div>
    );
};

export default FundTaskButton;
