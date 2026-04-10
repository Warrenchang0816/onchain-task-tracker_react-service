import type { ReactNode } from "react";
import Header from "../components/common/Header";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="app-layout">
            <Header />
            <main className="app-main">{children}</main>
            <footer className="app-footer">
                <div className="app-footer-brand">
                    <span className="app-footer-pulse" />
                    SYNTHETIC LEDGER
                </div>
                <span>© 2124 On-chain Task Tracker. Powered by Base L2.</span>
            </footer>
        </div>
    );
};

export default AppLayout;
