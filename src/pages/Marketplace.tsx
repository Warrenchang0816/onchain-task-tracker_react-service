import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { ethers } from "ethers";

type NFTOrder = {
    id?: number;
    title: string;
    description: string;
    image: string;
    price: string;
    sold?: boolean;
    purchaseTxHash?: string;
};

const CONTRACT_ADDRESS =
    import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS ||
    "0xd6aad452361D86C943bdb523b4EbeFCc5D2a44fc";

const ABI = ["function buy(uint256 orderId) payable"];

export default function Marketplace() {
    const [orders, setOrders] = useState<NFTOrder[]>([]);
    const [soldOrderIds, setSoldOrderIds] = useState<number[]>([]);
    const [error, setError] = useState("");

    async function handleBuy(order: NFTOrder) {
        try {
            if (!window.ethereum) {
                alert("請安裝 MetaMask");
                return;
            }

            if (order.id == null) {
                alert("order id missing");
                return;
            }

            if (soldOrderIds.includes(order.id)) {
                alert("這筆訂單已售出");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.buy(order.id, {
                value: ethers.parseEther(order.price || "0.01"),
            });

            await tx.wait();

            const res = await fetch(
                `http://localhost:8081/api/nft-orders/${order.id}/purchase`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ purchaseTxHash: tx.hash }),
                },
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "failed to update purchase status");
            }

            setSoldOrderIds((prev) => [...prev, order.id!]);
            setOrders((prev) =>
                prev.map((item) =>
                    item.id === order.id
                        ? { ...item, sold: true, purchaseTxHash: tx.hash }
                        : item,
                ),
            );

            alert(`購買成功（已上鏈）\nTX: ${tx.hash}`);
        } catch (err) {
            console.error(err);
            alert("購買失敗");
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const res = await fetch("http://localhost:8081/api/nft-orders");
                if (!res.ok) throw new Error("Failed to load nft orders");
                const data = await res.json();
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                      ? data.data
                      : [];
                setOrders(list);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error");
            }
        };

        void load();
    }, []);

    return (
        <AppLayout>
            <section className="page-section">
                <div className="page-heading-row">
                    <div className="page-heading">
                        <div className="page-label">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>storefront</span>
                            NFT EXCHANGE
                        </div>
                        <h1>NFT Marketplace</h1>
                        <p>Browse and acquire on-chain digital assets from the Synthetic Ledger network.</p>
                    </div>
                </div>

                {error && (
                    <div className="feedback-banner error-banner">
                        <p>{error}</p>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="page-state">
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            No NFT assets listed in the exchange
                        </p>
                    </div>
                )}

                <div className="marketplace-grid">
                    {orders.map((item, index) => {
                        const isSold =
                            item.sold === true ||
                            (item.id != null && soldOrderIds.includes(item.id));

                        return (
                            <div key={item.id ?? index} className="nft-card">
                                <div className="nft-card-image">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span className="nft-card-no-image">No Image</span>
                                    )}
                                    <span className={`nft-card-status ${isSold ? "sold" : "listed"}`}>
                                        {isSold ? "SOLD" : "LISTED"}
                                    </span>
                                </div>

                                <div className="nft-card-body">
                                    <div className="nft-card-title">{item.title}</div>
                                    <div className="nft-card-description">{item.description}</div>
                                    <div className="nft-card-price">
                                        {item.price || "0"} ETH
                                    </div>

                                    <div className="nft-card-actions">
                                        <button
                                            className="nft-card-buy-btn"
                                            onClick={() => handleBuy(item)}
                                            disabled={isSold}
                                        >
                                            {isSold ? "SOLD" : "BUY NOW"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </AppLayout>
    );
}
