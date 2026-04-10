import React from "react";

export type ListingStatus = "LISTED" | "SOLD" | "CANCELLED";

export interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  payoutWallet: string;
  status: ListingStatus;
  tokenId?: number;
}

interface NFTCardProps {
  item: MarketplaceListing;
  onView?: (id: number) => void;
  onBuy?: (item: MarketplaceListing) => void;
}

function shortenAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusStyle(status: ListingStatus): React.CSSProperties {
  switch (status) {
    case "LISTED":
      return {
        backgroundColor: "#ecfdf3",
        color: "#067647",
        border: "1px solid #abefc6",
      };
    case "SOLD":
      return {
        backgroundColor: "#f2f4f7",
        color: "#344054",
        border: "1px solid #d0d5dd",
      };
    case "CANCELLED":
      return {
        backgroundColor: "#fef3f2",
        color: "#b42318",
        border: "1px solid #fecdca",
      };
    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#344054",
        border: "1px solid #d0d5dd",
      };
  }
}

const NFTCard: React.FC<NFTCardProps> = ({ item, onView, onBuy }) => {
  const isBuyDisabled = item.status !== "LISTED";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 220,
          backgroundColor: "#f8fafc",
          overflow: "hidden",
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://picsum.photos/600/600?grayscale";
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.3,
              color: "#111827",
            }}
          >
            {item.title}
          </h3>

          <span
            style={{
              ...getStatusStyle(item.status),
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 10px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {item.status}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            color: "#475467",
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: 44,
          }}
        >
          {item.description}
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 12,
            border: "1px solid #eaecf0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            <span style={{ color: "#667085" }}>Price</span>
            <strong style={{ color: "#111827" }}>{item.price} SepoliaETH</strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            <span style={{ color: "#667085" }}>Payout Wallet</span>
            <span style={{ color: "#111827", fontFamily: "monospace" }}>
              {shortenAddress(item.payoutWallet)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <span style={{ color: "#667085" }}>Token ID</span>
            <span style={{ color: "#111827" }}>
              {item.tokenId !== undefined ? item.tokenId : "-"}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => onView?.(item.id)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "1px solid #d0d5dd",
              background: "#ffffff",
              color: "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View Detail
          </button>

          <button
            type="button"
            disabled={isBuyDisabled}
            onClick={() => onBuy?.(item)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "none",
              background: isBuyDisabled ? "#d0d5dd" : "#0f172a",
              color: "#ffffff",
              fontWeight: 700,
              cursor: isBuyDisabled ? "not-allowed" : "pointer",
            }}
          >
            {item.status === "LISTED" ? "Buy Now" : item.status}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;