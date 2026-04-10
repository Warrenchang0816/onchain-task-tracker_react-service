import { useState } from "react";

type CreateNFTOrderRequest = {
  title: string;
  description: string;
  creatorWallet: string;
  priceEth: string;
  royaltyBps: number;
  creatorShareBps: number;
  imageUrl: string;
};

type CreateNFTOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_GO_SERVICE_URL ?? "http://localhost:8081/api";

export default function CreateNFTOrderModal({
  isOpen,
  onClose,
  onCreated,
}: CreateNFTOrderModalProps) {
  const [form, setForm] = useState<CreateNFTOrderRequest>({
    title: "",
    description: "",
    creatorWallet: "",
    priceEth: "0",
    royaltyBps: 1000, // 10%
    creatorShareBps: 8500, // 85%
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");

const handleClose = () => {
  if (submitting) return;
  resetForm();
  onClose();
};

if (!isOpen) return null;

  const handleChange = (
    field: keyof CreateNFTOrderRequest,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      creatorWallet: "",
      priceEth: "0",
      royaltyBps: 1000,
      creatorShareBps: 8500,
      imageUrl: "",
    });
    setImageFile(null);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      let imageUrl = form.imageUrl;

      // 先上傳圖片
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || "upload failed");
        }

        imageUrl = uploadData.url;
      }

      // 再建立 NFT order
      const res = await fetch(`${API_BASE_URL}/nft-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          image: imageUrl, // 先對齊你目前後端欄位
          price: form.priceEth, // 先對齊你目前後端欄位
          recipientWallet: form.creatorWallet, // 先沿用你目前 API 結構
          creatorWallet: form.creatorWallet,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "failed to create NFT order");
      }

      alert("NFT order created successfully");
      handleClose();
      resetForm();
      onClose();
      onCreated?.();
    } catch (e: any) {
      setError(e.message || "something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>Create NFT Order</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: 12 }}>
            {error}
          </p>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label>NFT Name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter NFT name"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe this NFT order"
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <label>Creator Wallet</label>
            <input
              type="text"
              value={form.creatorWallet}
              onChange={(e) => handleChange("creatorWallet", e.target.value)}
              placeholder="0x..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <label>Price (ETH)</label>
            <input
              type="number"
              step="0.0001"
              value={form.priceEth}
              onChange={(e) => handleChange("priceEth", e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Royalty (%)</label>
              <input
                type="number"
                value={form.royaltyBps / 100}
                onChange={(e) =>
                  handleChange("royaltyBps", Number(e.target.value) * 100)
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  marginTop: 6,
                }}
              />
            </div>

            <div>
              <label>Creator Share (%)</label>
              <input
                type="number"
                value={form.creatorShareBps / 100}
                onChange={(e) =>
                  handleChange("creatorShareBps", Number(e.target.value) * 100)
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  marginTop: 6,
                }}
              />
            </div>
          </div>

          <div>
            <label>Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <label>Or Image URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://... or leave empty if uploading file"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 6,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
  onClick={handleClose}
  disabled={submitting}
  style={{
    minWidth: 120,
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "#111827",   // 🔥 黑底
    color: "#ffffff",        // 🔥 白字
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Cancel
</button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#0b1736",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {submitting ? "Creating..." : "Create NFT Order"}
          </button>
        </div>
      </div>
    </div>
  );
}