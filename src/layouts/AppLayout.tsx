import type { ReactNode } from "react";
import Header from "../components/common/Header";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="app-layout">
            <Header />
            <main>{children}</main>
            <footer className="app-footer">
                <div className="app-footer-inner">
                    <div className="app-footer-brand">
                        <span className="app-footer-title">Synthetic Ledger</span>
                        <p className="app-footer-copy">© 2124 On-chain Task Tracker. Powered by Base L2</p>
                    </div>
                    <div className="app-footer-links">
                        <a href="#">Protocol</a>
                        <a href="#">Docs</a>
                        <a href="#">Security</a>
                        <a href="#">Terminal</a>
                    </div>
                    <div className="app-footer-pulse">
                        <div className="app-footer-pulse-dot" />
                        <span className="app-footer-pulse-label">Node Sync: 100%</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;
