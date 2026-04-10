import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { ui, colors } from "../styles/ui";
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

    console.log("tx:", tx.hash);

    await tx.wait();

    console.log("purchase tx hash:", tx.hash);

    const res = await fetch(
      `http://localhost:8081/api/nft-orders/${order.id}/purchase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseTxHash: tx.hash,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "failed to update purchase status");
    }

    setSoldOrderIds((prev) => [...prev, order.id]);

    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? {
              ...item,
              sold: true,
              purchaseTxHash: tx.hash,
            }
          : item
      )
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

        if (!res.ok) {
          throw new Error("Failed to load nft orders");
        }

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

    load();
  }, []);

  return (
    <AppLayout>
      <section className="page-section">
        <h1 style={ui.pageTitle}>Marketplace</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {!error && orders.length === 0 && <p>No NFT yet</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            marginTop: 24,
          }}
        >
          {orders.map((item, index) => {
            const isSold = item.sold === true || (item.id != null && soldOrderIds.includes(item.id));

            return (
              <div key={item.id ?? index} style={ui.card}>
                <div
                  style={{
                    width: "100%",
                    height: 220,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div style={{ color: colors.subtext, fontSize: 14 }}>
                      No Image
                    </div>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: 22,
                      color: colors.text,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: colors.subtext,
                      minHeight: 48,
                    }}
                  >
                    {item.description}
                  </p>

                  <p
                    style={{
                      margin: "0 0 16px",
                      fontWeight: 700,
                      fontSize: 18,
                      color: colors.text,
                    }}
                  >
                    💰 {item.price || "0"} ETH
                  </p>

                  <button
                    style={{
                      ...ui.primaryButton,
                      width: "100%",
                      opacity: isSold ? 0.6 : 1,
                      cursor: isSold ? "not-allowed" : "pointer",
                    }}
                    onClick={() => handleBuy(item)}
                    disabled={isSold}
                  >
                    {isSold ? "Sold" : "Buy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}