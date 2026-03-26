import type { ReactNode } from "react";
import Header from "../components/common/Header";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div>
            <Header />
            <main>{children}</main>
        </div>
    );
};

export default AppLayout;