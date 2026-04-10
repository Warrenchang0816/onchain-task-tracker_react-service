import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WagmiProvider>
  </React.StrictMode>
);