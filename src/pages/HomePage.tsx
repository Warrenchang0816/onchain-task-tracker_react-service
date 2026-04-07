import { useNavigate } from "react-router-dom";
import SidebarLayout from "../layouts/SidebarLayout";
import { useProducts } from "../contexts/ProductContext";
import { useWallet } from "../components/common/WalletConnect";

const HomePage = () => {
  const navigate = useNavigate();
  const { products, orders } = useProducts();
  const { account } = useWallet();

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalProducts   = products.length;
  const availableProducts = products.filter((p) => p.status === "PUBLISHED").length;
  const totalOrders     = orders.length;
  const placedOrders    = orders.filter((o) => o.status === "PLACED").length;
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;

  // My orders (if wallet connected)
  const myOrders = account
    ? orders.filter((o) => o.customerAddress.toLowerCase() === account.toLowerCase())
    : [];
  const myProducts = account
    ? products.filter((p) => p.merchantAddress?.toLowerCase() === account.toLowerCase())
    : [];

  // ── Kanban columns built from real data ────────────────────────────────────
  const columns = [
    {
      title: "上架中",
      label: String(availableProducts),
      accent: "#d9f7ec",
      empty: "尚無上架商品",
      action: () => navigate("/merchant/products"),
      actionLabel: "上架商品",
      cards: products
        .filter((p) => p.status === "PUBLISHED")
        .slice(0, 3)
        .map((p) => ({
          title: p.name,
          badge: p.category ?? "商品",
          sub: `原價 $${p.originalPrice} → $${p.discountedPrice}`,
          progress: Math.min(100, Math.round(((p.quantity - (p.availableQty ?? p.quantity)) / Math.max(p.quantity, 1)) * 100)),
          note: `剩餘 ${p.availableQty ?? p.quantity} 份`,
          border: "#dcfce7",
          onClick: () => navigate("/merchant/products"),
        })),
    },
    {
      title: "待確認訂單",
      label: String(placedOrders),
      accent: "#fef9c3",
      empty: "目前沒有待確認訂單",
      action: () => navigate("/merchant/orders"),
      actionLabel: "查看訂單",
      cards: orders
        .filter((o) => o.status === "PLACED")
        .slice(0, 3)
        .map((o) => {
          const product = products.find((p) => p.id === o.productId || p.productId === o.productId);
          return {
            title: product?.name ?? `訂單 ${o.orderId.slice(0, 8)}`,
            badge: "待確認",
            sub: `數量：${o.quantity} ｜ 合計 $${o.totalPrice}`,
            progress: 25,
            note: o.customerAddress.slice(0, 10) + "…",
            border: "#fef9c3",
            onClick: () => navigate("/merchant/orders"),
          };
        }),
    },
    {
      title: "進行中",
      label: String(confirmedOrders),
      accent: "#dbeafe",
      empty: "目前沒有進行中訂單",
      action: () => navigate("/merchant/orders"),
      actionLabel: "查看訂單",
      cards: orders
        .filter((o) => o.status === "CONFIRMED")
        .slice(0, 3)
        .map((o) => {
          const product = products.find((p) => p.id === o.productId || p.productId === o.productId);
          return {
            title: product?.name ?? `訂單 ${o.orderId.slice(0, 8)}`,
            badge: "已確認",
            sub: `數量：${o.quantity} ｜ 合計 $${o.totalPrice}`,
            progress: 65,
            note: "等待取貨",
            border: "#dbeafe",
            onClick: () => navigate("/merchant/orders"),
          };
        }),
    },
    {
      title: "已完成",
      label: String(completedOrders),
      accent: "#f4f5f6",
      empty: "尚無完成訂單",
      action: () => navigate("/products"),
      actionLabel: "瀏覽商品",
      cards: orders
        .filter((o) => o.status === "COMPLETED")
        .slice(0, 3)
        .map((o) => {
          const product = products.find((p) => p.id === o.productId || p.productId === o.productId);
          return {
            title: product?.name ?? `訂單 ${o.orderId.slice(0, 8)}`,
            badge: "已完成",
            sub: `合計 $${o.totalPrice}`,
            progress: 100,
            note: "Done",
            border: "#e5e7eb",
            onClick: () => navigate("/customer/history"),
          };
        }),
    },
  ];

  return (
    <SidebarLayout>
      {/* ── Top stats bar ─────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        {[
          { icon: "storefront",    label: "上架商品",  value: availableProducts, total: totalProducts,  color: "#059669", bg: "#ecfdf5", onClick: () => navigate("/products") },
          { icon: "receipt_long",  label: "待確認",    value: placedOrders,      total: totalOrders,    color: "#d97706", bg: "#fffbeb", onClick: () => navigate("/merchant/orders") },
          { icon: "local_shipping",label: "進行中",    value: confirmedOrders,   total: totalOrders,    color: "#2563eb", bg: "#eff6ff", onClick: () => navigate("/merchant/orders") },
          { icon: "check_circle",  label: "已完成",    value: completedOrders,   total: totalOrders,    color: "#16a34a", bg: "#f0fdf4", onClick: () => navigate("/customer/history") },
          { icon: "cancel",        label: "已取消",    value: cancelledOrders,   total: totalOrders,    color: "#dc2626", bg: "#fef2f2", onClick: () => navigate("/merchant/orders") },
        ].map(({ icon, label, value, total, color, bg, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            style={{
              background: "white", border: `1.5px solid ${bg}`,
              borderRadius: 14, padding: "18px 20px",
              textAlign: "left", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: bg, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 10,
            }}>
              <span className="material-symbols-outlined" style={{ color, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", fontFamily: "Manrope,sans-serif", lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {label}　<span style={{ color: "#d1d5db" }}>/ {total}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── My quick info (if connected) ───────────────────────────────────── */}
      {account && (myOrders.length > 0 || myProducts.length > 0) && (
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
          border: "1.5px solid #d1fae5", borderRadius: 14,
          padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center",
        }}>
          <span className="material-symbols-outlined" style={{ color: "#10b981", fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          <span style={{ fontSize: 13, color: "#065f46", fontFamily: "monospace" }}>
            {account.slice(0, 6)}…{account.slice(-4)}
          </span>
          {myProducts.length > 0 && (
            <span style={{ fontSize: 13, color: "#059669" }}>
              我的商品：<strong>{myProducts.length}</strong> 項
            </span>
          )}
          {myOrders.length > 0 && (
            <span style={{ fontSize: 13, color: "#059669" }}>
              我的訂單：<strong>{myOrders.length}</strong> 筆
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate("/customer/history")}
            style={{
              marginLeft: "auto", background: "#10b981", color: "white",
              border: "none", borderRadius: 8, padding: "7px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            查看我的訂單
          </button>
        </div>
      )}

      {/* ── Board header ───────────────────────────────────────────────────── */}
      <div className="eco-board-header">
        <div>
          <h1 className="eco-heading">平台即時看板</h1>
          <p className="eco-subtitle">商品與訂單狀態總覽</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/merchant/products")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg,#10b981,#059669)",
            color: "white", border: "none", borderRadius: 10,
            padding: "10px 18px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          上架食物
        </button>
      </div>

      {/* ── Kanban ─────────────────────────────────────────────────────────── */}
      <div className="eco-board-grid">
        {columns.map((column) => (
          <section key={column.title} className="eco-column">
            <div className="eco-column-header">
              <div className="eco-column-title">
                <span className="eco-column-badge" style={{ background: column.accent }} />
                <span>{column.title}</span>
              </div>
              <span className="eco-pill">{column.label}</span>
            </div>

            {column.cards.length === 0 ? (
              <div style={{
                padding: "20px 16px", borderRadius: 12,
                background: "white", border: "1.5px dashed #e5e7eb",
                textAlign: "center", color: "#9ca3af", fontSize: 13,
              }}>
                {column.empty}
              </div>
            ) : (
              column.cards.map((card, i) => (
                <div
                  key={i}
                  className="eco-card"
                  style={{ borderColor: card.border, cursor: "pointer" }}
                  onClick={card.onClick}
                >
                  <div className="eco-card-top">
                    <span className="eco-card-tag">{card.badge}</span>
                    <span className="eco-card-dots material-symbols-outlined">open_in_new</span>
                  </div>
                  <h3 className="eco-card-title">{card.title}</h3>
                  <div className="eco-card-body">
                    <div className="eco-card-progress">
                      <div className="eco-progress-bar" style={{ width: `${card.progress}%` }} />
                    </div>
                    <div className="eco-card-meta">{card.sub}</div>
                  </div>
                  <div className="eco-card-footer">
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{card.note}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: card.progress === 100 ? "#16a34a" : "#2563eb",
                    }}>
                      {card.progress === 100 ? "✓ Done" : `${card.progress}%`}
                    </span>
                  </div>
                </div>
              ))
            )}

            <button type="button" className="eco-column-add" onClick={column.action}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
              {column.actionLabel}
            </button>
          </section>
        ))}
      </div>

      {/* Mobile bottom nav */}
      <nav className="eco-mobile-bottom-nav">
        <button type="button" className="eco-mobile-item active">
          <span className="material-symbols-outlined">home_app_logo</span>
          <span>首頁</span>
        </button>
        <button type="button" className="eco-mobile-item" onClick={() => navigate("/products")}>
          <span className="material-symbols-outlined">storefront</span>
          <span>美食</span>
        </button>
        <button type="button" className="eco-mobile-item eco-mobile-item--primary" onClick={() => navigate("/merchant/products")}>
          <span className="material-symbols-outlined">add</span>
        </button>
        <button type="button" className="eco-mobile-item" onClick={() => navigate("/customer/history")}>
          <span className="material-symbols-outlined">receipt_long</span>
          <span>訂單</span>
        </button>
      </nav>
    </SidebarLayout>
  );
};

export default HomePage;
