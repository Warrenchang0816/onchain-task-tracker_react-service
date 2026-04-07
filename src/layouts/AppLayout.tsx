import type { ReactNode } from "react";
import Header from "../components/common/Header";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    // When rendered inside the homepage sidebar iframe, hide the outer chrome
    const isEmbedded = new URLSearchParams(window.location.search).get("embedded") === "1";

    if (isEmbedded) {
        return (
            <div style={{ background: "var(--eco-surface)", minHeight: "100vh" }}>
                <main style={{ padding: "24px 32px" }}>{children}</main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Header />
            <main>{children}</main>
            <footer className="app-footer">
                <div className="app-footer-inner">
                    <div className="app-footer-brand">
                        <span className="app-footer-title">GreenFood 即期食物銷售平台</span>
                        <p className="app-footer-copy">© 2024 GreenFood Platform.</p>
                    </div>
                    <div className="app-footer-links">
                        <a href="/merchant/kyc">商家入駐</a>
                        <a href="/my/coins">平台幣</a>
                        <a href="/logs">交易紀錄</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;
