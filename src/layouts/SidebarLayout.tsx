import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/common/Header";

const sidebarLinks = [
    { label: "首頁",    icon: "home_app_logo",  route: "/"                  },
    { label: "即期美食", icon: "storefront",      route: "/products"           },
    { label: "客戶註冊", icon: "person_add",      route: "/customer/register"  },
    { label: "我的訂單", icon: "receipt_long",    route: "/customer/history"   },
    { label: "KYC 認證", icon: "verified_user",   route: "/merchant/kyc"      },
    { label: "發佈商品", icon: "inventory_2",     route: "/merchant/products" },
    { label: "訂單管理", icon: "list_alt",        route: "/merchant/orders"   },
    { label: "平台幣",   icon: "toll",            route: "/my/coins"          },
    { label: "交易紀錄", icon: "history",         route: "/logs"              },
];

interface SidebarLayoutProps {
    children: ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <div className="app-layout">
            <Header />

            <div className="eco-shell">
                {/* ── Sidebar ── */}
                <aside className="eco-sidebar">
                    <div className="eco-sidebar-top">
                        <div className="eco-brand-icon-mini">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                eco
                            </span>
                        </div>
                        <div>
                            <div className="eco-sidebar-title">GreenOps</div>
                            <div className="eco-sidebar-sub">Sustainable Productivity</div>
                        </div>
                    </div>

                    <nav className="eco-sidebar-nav">
                        {sidebarLinks.map(({ label, icon, route }) => {
                            const isActive =
                                route === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(route);
                            return (
                                <button
                                    key={route}
                                    type="button"
                                    className={
                                        isActive
                                            ? "eco-sidebar-link eco-sidebar-link--active"
                                            : "eco-sidebar-link"
                                    }
                                    onClick={() => navigate(route)}
                                >
                                    <span className="material-symbols-outlined">{icon}</span>
                                    {label}
                                </button>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        className="eco-sidebar-action"
                        onClick={() => navigate("/merchant/products")}
                    >
                        <span className="material-symbols-outlined">add</span>
                        發佈即期食物
                    </button>

                </aside>

                {/* ── Main content ── */}
                <main className="eco-shell-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
