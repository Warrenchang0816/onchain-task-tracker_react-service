import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ui, colors } from "../styles/ui";

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
    royaltyBps: 10,
    creatorShareBps: 85,
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;
 


  

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = <K extends keyof CreateNFTOrderRequest>(
    key: K,
    value: CreateNFTOrderRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      creatorWallet: "",
      priceEth: "0",
      royaltyBps: 10,
      creatorShareBps: 85,
      imageUrl: "",
    });
    setImageFile(null);
    setError("");
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      let finalImageUrl = form.imageUrl.trim();

      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);

        const uploadRes = await fetch("http://localhost:8081/api/upload", {
          method: "POST",
          body: uploadForm,
          credentials: "include",
        });

        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url || "";
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        creatorWallet: form.creatorWallet.trim(),
        priceEth: form.priceEth,
        royaltyBps: Number(form.royaltyBps),
        creatorShareBps: Number(form.creatorShareBps),
        imageUrl: finalImageUrl,
      };

      const res = await fetch(`${API_BASE_URL}/nft-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Create NFT order failed");
      }

      resetForm();
      onClose();
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={handleClose} style={ui.modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={ui.modalCard}>
        <div
          style={{
            padding: "24px 28px 18px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: colors.text }}>
              Create NFT Order
            </h2>
            <p style={{ margin: "8px 0 0", color: colors.subtext, fontSize: 14 }}>
              建立 NFT 訂單，完成後可在 Marketplace 顯示。
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={submitting}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "#fff",
              color: colors.text,
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 28 }}>
          {error && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 14px",
                borderRadius: 12,
                background: colors.dangerBg,
                border: `1px solid ${colors.dangerBorder}`,
                color: colors.dangerText,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "grid", gap: 18 }}>
            <Field label="NFT Name">
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter NFT name"
                style={ui.input}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe this NFT order"
                rows={4}
                style={{ ...ui.input, resize: "vertical", minHeight: 110 }}
              />
            </Field>

            <Field label="Creator Wallet">
              <input
                value={form.creatorWallet}
                onChange={(e) => updateField("creatorWallet", e.target.value)}
                placeholder="0x..."
                style={ui.input}
              />
            </Field>

            <Field label="Price (ETH)">
              <input
                type="number"
                min="0"
                step="0.0001"
                value={form.priceEth}
                onChange={(e) => updateField("priceEth", e.target.value)}
                style={ui.input}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Royalty (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.royaltyBps}
                  onChange={(e) => updateField("royaltyBps", Number(e.target.value))}
                  style={ui.input}
                />
              </Field>

              <Field label="Creator Share (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.creatorShareBps}
                  onChange={(e) => updateField("creatorShareBps", Number(e.target.value))}
                  style={ui.input}
                />
              </Field>
            </div>

            <Field label="Image File">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                style={ui.input}
              />
            </Field>

            <Field label="Or Image URL">
              <input
                value={form.imageUrl}
                onChange={(e) => updateField("imageUrl", e.target.value)}
                placeholder="https://..."
                style={ui.input}
              />
            </Field>
          </div>
        </div>

        <div
          style={{
            padding: "18px 28px 24px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={handleClose}
            disabled={submitting}
            style={ui.secondaryButton}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...ui.primaryButton,
              minWidth: 160,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating..." : "Create NFT Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{label}</span>
      {children}
    </label>
  );
}