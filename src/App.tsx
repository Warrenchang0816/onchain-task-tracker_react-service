import { RouterProvider } from "react-router-dom";
import { WalletProvider } from "./components/common/WalletConnect";
import { ProductProvider } from "./contexts/ProductContext";
import router from "./router";

function App() {
    return (
        <WalletProvider>
            <ProductProvider>
                <RouterProvider router={router} />
            </ProductProvider>
        </WalletProvider>
    );
}

export default App;