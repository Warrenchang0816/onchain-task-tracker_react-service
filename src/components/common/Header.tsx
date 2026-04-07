import { useNavigate } from "react-router-dom";
import WalletConnectPanel from "../wallet/WalletConnectPanel";
import PlatformCoinBadge from "./PlatformCoinBadge";

const Header = () => {
    const navigate = useNavigate();

    return (
        <>
            <header className="eco-header">
                <div className="eco-header-inner">
                    {/* Brand */}
                    <button
                        className="eco-brand"
                        onClick={() => navigate("/")}
                        type="button"
                    >
                        <div className="eco-brand-icon">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                            >
                                eco
                            </span>
                        </div>
                        <div>
                            <div className="eco-brand-name">GreenFood</div>
                            <div className="eco-brand-sub">即期食物銷售平台</div>
                        </div>
                    </button>

                    {/* Right side only — nav moved to sidebar */}
                    <div className="eco-header-right">
                        <PlatformCoinBadge />
                        <WalletConnectPanel />
                    </div>
                </div>
            </header>
            <div style={{ height: "72px" }} />
        </>
    );
};

export default Header;
