const API_BASE_URL =
  import.meta.env.VITE_API_GO_SERVICE_URL ?? "http://localhost:8081/api";

export interface NFTOrder {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  recipientWallet: string;
  creatorWallet: string;
}

export async function getNFTOrders(): Promise<NFTOrder[]> {
  const res = await fetch(`${API_BASE_URL}/nft-orders`);

  if (!res.ok) {
    throw new Error("Failed to fetch NFT orders");
  }

  const data = await res.json();
  return data.data || [];
}