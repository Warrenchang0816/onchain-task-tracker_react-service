# 功能討論文件

> **專案名稱：** On-chain Task Tracker（鏈上媒介平台）
> **日期：** 2026-03-28
> **參與成員：** （填入成員名稱）

---

## 1. 專案概述

On-chain Task Tracker 是一個以區塊鏈為基礎的需求與供給媒介平台，連接「需求方」與「供給方」，透過智能合約確保交易透明、不可竄改，並以穩定幣（USDC）作為支付媒介。平台提供四個主題頻道：**任務媒介、NFT 代發行服務、餐廳即期食物販售、每日目標清單**，每個頻道有各自的供需流程與鏈上機制。

---

## 2. 功能清單

### 平台核心功能（跨主題共用）

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| C1 | 錢包連接 | MetaMask / WalletConnect 連線，作為用戶身份 | 高 | |
| C2 | 角色選擇 | 使用者選擇以「需求方」或「供給方」身份操作（可雙重身份） | 高 | |
| C3 | 主題頻道導覽 | 四個主題的切換入口，各自有獨立的列表與操作頁面 | 高 | |
| C4 | 平台費用機制 | 每筆交易收取平台手續費，由智能合約自動扣除 | 高 | |
| C5 | 穩定幣支付整合 | 使用 USDC 作為平台統一支付媒介 | 高 | |

### 主題一：任務媒介

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T1-1 | 建立任務 | 需求方填寫標題、描述、報酬金額，資金鎖入合約托管 | 高 | willy88125 |
| T1-2 | 瀏覽任務列表 | 供給方瀏覽所有開放任務（未被接走的） | 高 | willy88125 |
| T1-3 | 接取任務 | 供給方先搶先贏，一人獨佔，接取後任務鎖定 | 高 | willy88125 |
| T1-4 | 任務提交 | 供給方完成後提交成果（文字描述 / 連結） | 高 | willy88125 |
| T1-5 | 需求方確認完成 | 需求方確認後，合約自動將報酬打給供給方 | 高 | willy88125 |
| T1-6 | 逾期自動完成 | 供給方提交後需求方逾期 7 天未確認，自動視為完成 | 中 | willy88125 |

### 主題二：NFT 代發行服務

> **定位：** 平台扮演「NFT 技術代工」角色，廠商完全不需要懂區塊鏈，只需填表付費，平台負責鑄造與分發。

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T2-1 | 廠商填寫發行需求 | 廠商填表（名稱、描述、圖片、數量、類型、是否收費）並以 USDC 支付服務費 | 高 | FF10560 |
| T2-2 | 平台代鑄造 NFT | 後端以平台錢包簽署交易，呼叫 Factory 合約批次鑄造 | 高 | FF10560 |
| T2-3 | 兌換連結產生 | 鑄造完成後產生可分享的 Claim Link，廠商分發給終端使用者 | 高 | FF10560 |
| T2-4 | 終端使用者 Claim NFT | 使用者開啟兌換連結、連接錢包，即可領取 NFT 至自己錢包 | 高 | karven99 |
| T2-5 | NFT 核銷功能 | 廠商輸入 Token ID 核銷（鏈上標記已使用），Phase 2 升級為 QR Code | 高 | karven99 |
| T2-6 | 廠商訂單後台 | 廠商查看鑄造數量、已領取數量、已核銷數量 | 中 | FF10560 |
| T2-7 | 批次空投（CSV） | 廠商上傳錢包地址名單，平台批次空投至持有者 | 低（Phase 2） | |
| T2-8 | Soulbound 不可轉讓選項 | 廠商可選擇 NFT 為靈魂綁定（非轉讓型），防止黃牛 | 低（Phase 2） | |

### 主題三：餐廳即期食物販售

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T3-1 | 餐廳上架即期食物 | 餐廳填寫品項、數量、折扣價、有效期限 | 高 | a7872122-design |
| T3-2 | 食物列表瀏覽 | 消費者瀏覽所有餐廳的即期食物 | 高 | a7872122-design |
| T3-3 | 購買食物憑證 NFT | 用 USDC 購買，收到 NFT 憑證（含品項與有效期） | 高 | a7872122-design |
| T3-4 | 餐廳核銷憑證 | 餐廳核銷買家 NFT，鏈上標記已使用，資金自動釋放 | 高 | a7872122-design |
| T3-5 | 過期自動退款 | NFT 超過有效期未核銷，合約自動退款給買家 | 中（Phase 2） | a7872122-design |

### 主題四：每日目標清單

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T4-1 | 建立目標 | 設定目標名稱、週期（自訂）、保證金金額（USDC） | 高 | Warrenchang0816 |
| T4-2 | 鎖定保證金 | 建立目標時，保證金鎖入合約 | 高 | Warrenchang0816 |
| T4-3 | 每日打卡 | 在週期內標記目標為完成 | 高 | Warrenchang0816 |
| T4-4 | 目標結算 | 完成 → 保證金退還；未完成 → 保證金沒收至平台金庫 | 高 | Warrenchang0816 |
| T4-5 | 目標歷史紀錄 | 查看過去所有目標的完成率與保證金結算歷史 | 中 | Warrenchang0816 |
| T4-6 | 社群功能 | 朋友可以看到你的目標進度，互相督促 | 低（Phase 3） | |

---

## 3. 功能拆解

---

### 功能 C1：錢包連接

**這個功能在幹嘛？**
> 使用者點擊「Connect Wallet」→ 觸發 MetaMask 授權 → 連線後 Header 顯示縮寫地址，WalletContext 儲存全域連線狀態。

**這筆資料需要上鏈嗎？**
> 不需要。錢包地址即身份，不需要額外上鏈。

#### 前端
- [ ] Header「Connect Wallet」按鈕
- [ ] 連線成功後顯示縮寫地址（`0xAbcd...1234`）
- [ ] WalletContext 管理 `isConnected`、`address`
- [ ] useWallet Hook 封裝連線邏輯

#### 後端
（不涉及）

#### 鏈上
（不涉及）

#### 資料怎麼流動？
```
使用者點擊「Connect Wallet」
  → 呼叫 wallet provider 請求授權
  → 取得 address → 更新 WalletContext
  → Header 顯示縮寫地址
```

---

### 功能 T1-1：建立任務（任務媒介）

**這個功能在幹嘛？**
> 需求方填寫任務標題、描述、報酬金額 → 送出後，報酬金額從需求方錢包扣除，鎖入合約托管（Escrow）→ 任務進入「開放接取」狀態。

**這筆資料需要上鏈嗎？**
> 需要。資金托管必須上鏈。任務內容存後端，僅將 `taskId + amount + creator + timestamp` 上鏈。

#### 前端
- [ ] /tasks/new 頁面，TaskForm（標題、描述、報酬金額）
- [ ] 送出前顯示「將鎖定 X USDC 至合約」確認提示
- [ ] 交易等待的 Loading 狀態
- [ ] 成功後導向 /tasks

#### 後端
- [ ] POST /api/tasks — 儲存任務內容
- [ ] GET /api/tasks — 回傳開放任務列表

#### 鏈上
- [ ] `createTask(taskId, amount)` — 鎖入 USDC
- [ ] `acceptTask(taskId)` — 供給方接取，任務鎖定
- [ ] `completeTask(taskId)` — 需求方確認，USDC 打給 executor（扣平台費）

#### 資料怎麼流動？
```
需求方填寫表單 → 點擊「發布任務」
  → 後端 POST /api/tasks → 取得 taskId
  → 前端呼叫合約 createTask(taskId, amount)
  → USDC 從錢包轉入合約
  → 任務出現在列表
```

---

### 功能 T2-1 ～ T2-5：NFT 代發行服務（核心流程）

**這個功能在幹嘛？**
> 廠商填表付費 → 平台後端代為鑄造 NFT → 產生兌換連結 → 終端使用者連錢包領取 → 廠商核銷。整個過程廠商不需要錢包或任何區塊鏈知識。

**這筆資料需要上鏈嗎？**
> 需要。NFT 本身必須上鏈（ERC-1155）。圖片存 IPFS，合約只儲存 metadataURI。
> 廠商服務費支付（USDC）也上鏈，確保透明。

#### 前端（廠商端）
- [ ] /nft/new 頁面：發行表單（名稱、描述、圖片上傳、數量、類型、是否需要持有者付費）
- [ ] 服務費試算顯示（數量 × 單價）
- [ ] 送出後顯示「鑄造中」進度狀態
- [ ] 鑄造完成後顯示兌換連結（可複製）
- [ ] /nft/orders 廠商後台：顯示各訂單的鑄造/領取/核銷數量
- [ ] 核銷頁面：輸入 Token ID → 呼叫合約核銷

#### 前端（終端使用者端）
- [ ] /claim/:claimCode 兌換頁面：顯示 NFT 資訊 + 「Connect Wallet & Claim」按鈕
- [ ] Claim 成功後顯示 NFT 圖片 + tx hash
- [ ] /nft/my 我的 NFT：顯示持有中的 NFT 與狀態（未使用 / 已核銷）

#### 後端
- [ ] POST /api/nft/orders — 接收廠商表單 + 圖片，上傳 IPFS，扣服務費，呼叫平台錢包鑄造
- [ ] GET /api/nft/orders — 廠商查詢自己的訂單列表
- [ ] POST /api/nft/claim/:claimCode — 終端使用者 Claim，觸發 mint 至使用者錢包
- [ ] POST /api/nft/:tokenId/redeem — 廠商核銷

#### 鏈上（智能合約）
- [ ] ERC-1155 Factory 合約
- [ ] `createCollection(name, maxSupply, metadataURI, priceUSDC)` — **由平台錢包簽署**（廠商不需要）
- [ ] `claim(collectionId, recipient)` — 鑄造 NFT 至指定地址
- [ ] `redeem(tokenId)` — 標記已核銷（不可重複）

#### 資料怎麼流動？
```
【廠商側】
廠商填表 → 點「送出並付款」
  → 廠商 USDC approve → transferFrom 服務費至平台
  → 後端上傳圖片至 IPFS → 取得 metadataURI
  → 平台錢包呼叫合約 createCollection(...)
  → 鑄造完成 → 後端產生 claimCode，儲存至 DB
  → 顯示兌換連結給廠商

【終端使用者側】
使用者打開兌換連結 /claim/abc123
  → 顯示 NFT 資訊
  → 使用者連接錢包 → 點「領取」
  → 後端驗證 claimCode 有效 → 呼叫合約 claim(collectionId, userAddress)
  → NFT 鑄造至使用者錢包
  → 顯示成功

【核銷側】
廠商在後台輸入 Token ID → 點「核銷」
  → 呼叫合約 redeem(tokenId)
  → 鏈上標記已使用，無法重複核銷
```

#### 備註
- 平台需維護一個「平台錢包」（後端服務錢包），用於代簽所有鑄造交易
- Gas 費用由平台服務費中支付（廠商完全無感）
- **Phase 2 擴充：** 批次空投（廠商提供 CSV 錢包名單）、Soulbound 不可轉讓選項

---

### 功能 T3-3 + T3-4：食物 NFT 購買 + 核銷（餐廳即期食物）

**這個功能在幹嘛？**
> 消費者購買即期食物 → 收到 NFT 憑證 → 到餐廳出示 → 餐廳核銷 NFT，資金自動釋放。

**這筆資料需要上鏈嗎？**
> 需要。NFT 憑證的購買與核銷都需要上鏈，確保防偽與不可重複使用。

#### 資料怎麼流動？
```
消費者點擊「購買」
  → USDC approve → 呼叫合約 mint(foodCollectionId)
  → NFT 鑄造至消費者錢包
  → 消費者到餐廳，出示 Token ID 或 QR Code
  → 餐廳呼叫合約 redeem(tokenId)
  → USDC 從合約釋放給餐廳（扣平台費）
```

---

### 功能 T4-1 + T4-4：建立目標 + 結算（每日目標清單）

**這個功能在幹嘛？**
> 使用者設定目標並鎖定保證金 → 週期內打卡 → 週期結束自動結算：完成退款、未完成沒收。

**這筆資料需要上鏈嗎？**
> 需要。保證金的鎖定與結算必須上鏈，確保規則透明、無法竄改。

#### 資料怎麼流動？
```
使用者建立目標
  → 合約 createGoal(goalId, amount, deadline, requiredCheckins)
  → USDC 鎖入合約
  → 每日（或週期內）打卡 → 合約 checkIn(goalId) 記錄時間戳
  → 週期結束 → 呼叫 settle(goalId)
  → 完成 → USDC 退還；未完成 → USDC 沒收至平台金庫
```

---

## 4. 開發順序

```
Phase 1（跑通所有主題的核心主流程）：
  ── 可並行 ──
  [平台核心]
    → C1 錢包連接 + WalletContext
    → C3 主題頻道導覽框架（AppLayout、Header）
    → C5 USDC 整合
    → 後端：Go 專案初始化 + PostgreSQL Schema
    → 合約：Foundry 設定 + Base Sepolia 部署流程

  [T1 任務媒介 - willy88125]
    → 建立任務（Escrow 合約）
    → 任務列表瀏覽
    → 接取任務
    → 任務提交
    → 需求方確認完成 + 自動打款

  [T2 NFT 代發行服務 - FF10560 + karven99]
    → 廠商填表 + USDC 服務費付款
    → 平台後端代鑄造（平台錢包 + Factory 合約）
    → 兌換連結產生
    → 終端使用者 Claim NFT
    → 廠商核銷（輸入 Token ID）

  [T3 餐廳即期食物 - a7872122-design]
    → 餐廳上架食物
    → 消費者瀏覽 + 購買 NFT 憑證
    → 餐廳核銷憑證 + 資金釋放

  [T4 每日目標清單 - Warrenchang0816]
    → 建立目標 + 鎖定保證金
    → 每日打卡
    → 目標結算（退款/沒收）

Phase 2（補強細節 + 進階功能）：
  → T1：逾期 7 天自動完成、任務歷史紀錄
  → T2：批次空投（CSV 上傳）、Soulbound 不可轉讓選項、廠商後台統計圖表
  → T3：過期 NFT 自動退款合約、倒計時顯示
  → T4：目標歷史紀錄頁面、完成率統計

Phase 3（商業化與擴充）：
  → 法幣付款（信用卡接入）
  → QR Code 掃描核銷（T2 + T3）
  → NFT 二手轉售市場
  → T4 社群功能（朋友互相督促）
  → 多鏈支援
```

---

## 5. 技術架構

| 層級 | 技術選擇 | 備註 |
|------|---------|------|
| **前端框架** | React + TypeScript + Vite | 快速 HMR，型別安全 |
| **樣式** | Tailwind CSS + shadcn/ui | 符合「乾淨、卡片式」設計方針 |
| **Web3 套件** | wagmi + viem | React Hooks 封裝，對接合約最方便 |
| **狀態管理** | React Context API → Zustand（Phase 2） | 隨複雜度升級 |
| **後端框架** | Go + Gin | 已確定 |
| **資料庫** | PostgreSQL | 結構化資料 |
| **NFT 標準** | ERC-1155（Factory 合約） | 一合約管理多系列，節省 Gas |
| **支付代幣** | USDC（穩定幣） | 避免 ETH 價格波動 |
| **鏈** | Base（Layer 2） | 低 Gas、EVM 相容 |
| **合約語言** | Solidity | |
| **合約框架** | Foundry | 測試速度快 |
| **圖片/Metadata** | IPFS（Pinata） | NFT metadata 去中心化存儲 |
| **平台服務錢包** | 後端環境變數管理私鑰 | T2 代鑄造用，需妥善保管 |
| **前端部署** | Vercel | |
| **後端部署** | Railway 或 Fly.io | |

---

## 6. 核心 TypeScript 資料模型

```typescript
// 任務（主題一）
export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'Open' | 'InProgress' | 'Submitted' | 'Completed';
  creator: string;
  executor: string | null;
  createdAt: string;
  transactionHash?: string;
}

// NFT 發行訂單（主題二）
export interface NFTOrder {
  id: string;
  name: string;
  description: string;
  metadataURI: string;       // IPFS URI
  totalSupply: number;
  claimed: number;
  redeemed: number;
  priceUSDC: number;         // 服務費（按數量）
  collectionType: 'Ticket' | 'Membership' | 'Credential';
  issuerAddress: string;     // 廠商地址（付費方）
  claimCode: string;         // 兌換連結的 code
  status: 'Minting' | 'Ready' | 'Completed';
  createdAt: string;
}

// 終端使用者持有的 NFT
export interface NFTItem {
  tokenId: string;
  collectionId: string;
  ownerAddress: string;
  status: 'Active' | 'Redeemed' | 'Expired';
  claimedAt: string;
  redeemedAt?: string;
}

// 食物品項（主題三）
export interface FoodListing {
  id: string;
  restaurantName: string;
  itemName: string;
  priceUSDC: number;
  quantity: number;
  remaining: number;
  expiresAt: string;
  nftCollectionId: string;
}

// 目標（主題四）
export interface Goal {
  id: string;
  title: string;
  depositAmount: number;
  startDate: string;
  endDate: string;
  checkinCount: number;
  requiredCheckins: number;
  status: 'Active' | 'Completed' | 'Failed' | 'Settled';
  owner: string;
}

// 錢包狀態
export interface WalletState {
  isConnected: boolean;
  address: string | null;
}
```

---

## 7. 待討論 / 未決定事項

- [ ] **平台手續費率？** 建議：T1 任務媒介 3%、T2 代發行按數量收 0.5 USDC/個、T3 食物 2%
- [ ] **T4 沒收保證金去哪？** 選項：a) 平台金庫 b) 銷毀 c) 捐慈善地址
- [ ] **T2 平台服務錢包的安全管理方案**（私鑰不能 hardcode，考慮 AWS KMS 或 HashiCorp Vault）
- [ ] **Base Sepolia 測試網 USDC 合約地址** 需在開發前確認
- [ ] **T3 餐廳是否需要審核？** 任何人都能上架，還是需要平台 KYC？
- [ ] **T1 逾期天數：** 需求方幾天內未確認視為自動完成？（建議 7 天）

---

## 8. 參考資源

- [前端架構技術規格書 (MVP 階段)](./On-chain%20Task%20Tracker%20前端架構技術規格書%20(MVP%20階段).pdf)
- [專案開發路徑圖](./Task%20Tracker%20專案開發路徑圖：從架構定義到%20MVP%20實作落地.pdf)
- wagmi 官方文件 — React Web3 Hooks
- viem 官方文件 — TypeScript Ethereum 工具庫
- OpenZeppelin ERC-1155 — NFT Factory 合約基礎
- Pinata — IPFS 圖片/Metadata 上傳服務
- Base 官方文件 — Layer 2 鏈資訊
- Foundry Book — 智能合約開發框架
