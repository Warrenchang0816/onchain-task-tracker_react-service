import { useState } from "react";
import CreateNFTOrderModal from "../components/CreateNFTOrderModal";
import AppLayout from "../layouts/AppLayout";
import AppButton from "../components/common/AppButton";

export default function NFTTasksPage() {
  const [openNFTOrderModal, setOpenNFTOrderModal] = useState(false);

  return (
    <AppLayout>
      <section className="page-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>NFT Tasks</h1>
            <p style={{ marginTop: 8, color: "#667085" }}>
              建立 NFT 訂單，之後可接到 Marketplace 展示與販售。
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <AppButton type="button" onClick={() => alert("原本 Create Task")}>
              Create Task
            </AppButton>

            <AppButton
              type="button"
              onClick={() => setOpenNFTOrderModal(true)}
            >
              Create NFT Order
            </AppButton>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #eaecf0",
            boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>NFT Order Management</h2>
          <p style={{ color: "#667085", marginBottom: 0 }}>
            這裡之後可以放 NFT 訂單列表、建立狀態、mint 狀態、Marketplace 上架狀態。
          </p>
        </div>

        <CreateNFTOrderModal
          isOpen={openNFTOrderModal}
          onClose={() => setOpenNFTOrderModal(false)}
          onCreated={() => {
            console.log("NFT order created");
            setOpenNFTOrderModal(false);
            // 之後這裡可重新抓列表
          }}
        />
      </section>
    </AppLayout>
  );
}