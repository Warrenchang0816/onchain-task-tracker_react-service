# 功能討論文件

> **專案名稱：** On-chain Task Tracker（鏈上媒介平台）
> **日期：** 2026-03-27
> **參與成員：** （填入成員名稱）

---

## 1. 專案概述

On-chain Task Tracker 是一個以區塊鏈為基礎的需求與供給媒介平台，連接「需求方」與「供給方」，透過智能合約確保交易透明、不可竄改，並以穩定幣作為支付媒介。平台提供四個主題頻道：**任務媒介、NFT 採購媒介、餐廳即期食物販售、每日目標清單**，每個頻道有各自的供需流程與鏈上機制。

---

## 2. 功能清單

### 平台核心功能（跨主題共用）

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| C1 | 錢包連接 | MetaMask / WalletConnect 連線，作為用戶身份 | 高 | |
| C2 | 角色選擇 | 使用者選擇以「需求方」或「供給方」身份操作（可雙重身份） | 高 | |
| C3 | 主題頻道導覽 | 四個主題的切換入口，各自有獨立的列表與操作頁面 | 高 | |
| C4 | 平台費用機制 | 每筆交易收取平台手續費（百分比），由智能合約自動扣除 | 高 | |
| C5 | 穩定幣支付整合 | 使用 USDC 作為平台統一支付媒介 | 高 | |

### 主題一：任務媒介

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T1-1 | 建立任務 | 需求方填寫標題、描述、報酬金額，資金鎖入合約托管 | 高 | |
| T1-2 | 瀏覽任務列表 | 供給方瀏覽所有開放任務（未被接走的） | 高 | |
| T1-3 | 接取任務 | 供給方先搶先贏，一人獨佔，接取後任務鎖定 | 高 | |
| T1-4 | 任務提交 | 供給方完成後提交成果（文字描述 / 連結） | 高 | |
| T1-5 | 需求方確認完成 | 需求方確認後，合約自動將報酬打給供給方 | 高 | |
| T1-6 | 任務爭議處理 | 供給方提交後需求方逾期未確認，自動視為完成 | 中 | |
| T1-7 | 任務歷史紀錄 | 雙方可查看自己的任務歷史與交易紀錄 | 中 | |

### 主題二：NFT 採購媒介

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T2-1 | NFT 發行（供給方） | 填表單（名稱、描述、圖片、數量、單價）→ 平台 Factory 合約鑄造 | 高 | |
| T2-2 | NFT 市集瀏覽 | 需求方瀏覽所有可購買的 NFT 系列 | 高 | |
| T2-3 | 購買 NFT | 用穩定幣購買，NFT 懶鑄造直接到買家錢包 | 高 | |
| T2-4 | 我的 NFT 持有展示 | 使用者查看自己錢包中持有的 NFT | 中 | |
| T2-5 | NFT 核銷（供給方） | 供給方掃描或確認買家 NFT，鏈上標記為已使用 | 中 | |

### 主題三：餐廳即期食物販售

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T3-1 | 餐廳上架即期食物 | 餐廳（供給方）填寫品項、數量、折扣價、有效期限 | 高 | |
| T3-2 | 食物列表瀏覽 | 需求方瀏覽附近或全部餐廳的即期食物 | 高 | |
| T3-3 | 購買食物憑證 NFT | 用穩定幣購買，收到 NFT 憑證（含品項與有效期） | 高 | |
| T3-4 | 餐廳核銷憑證 | 餐廳掃描/確認買家 NFT → 鏈上標記已核銷 | 高 | |
| T3-5 | 過期自動退款 | NFT 超過有效期未核銷，合約自動退款給買家 | 中 | |

### 主題四：每日目標清單

| # | 功能名稱 | 簡短描述 | 優先級 | 負責人 |
|---|---------|---------|--------|--------|
| T4-1 | 建立目標 | 設定目標名稱、週期（自訂）、保證金金額（穩定幣） | 高 | |
| T4-2 | 鎖定保證金 | 建立目標時，保證金鎖入合約 | 高 | |
| T4-3 | 每日打卡 / 標記完成 | 在週期內標記目標為完成 | 高 | |
| T4-4 | 目標結算 | 週期結束：完成 → 保證金退還；未完成 → 保證金沒收（進入平台基金或銷毀） | 高 | |
| T4-5 | 目標歷史紀錄 | 查看過去所有目標的完成率與保證金狀況 | 中 | |
| T4-6 | 社群功能（下一階段） | 朋友可以看到你的目標進度，互相督促 | 低（暫緩） | |

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
（不涉及 — 錢包本身即身份）

#### 資料怎麼流動？
```
使用者點擊「Connect Wallet」
  → 呼叫 wallet provider 請求授權
  → 取得 address → 更新 WalletContext
  → Header 顯示縮寫地址
  → 全站元件可透過 useWallet() 讀取狀態
```

#### 備註
- 依賴：無（所有功能的前提）
- 初期支援 MetaMask，後期擴充 WalletConnect

---

### 功能 T1-1：建立任務（任務媒介）

**這個功能在幹嘛？**
> 需求方填寫任務標題、描述、報酬金額 → 送出後，報酬金額從需求方錢包扣除，鎖入合約托管（Escrow）→ 任務進入「開放接取」狀態。

**這筆資料需要上鏈嗎？**
> **需要**。資金托管必須上鏈，確保需求方不能臨時取消打款；任務建立紀錄也上鏈，確保透明可查。
> 但任務標題/描述較長，建議：內容存後端，僅將 `taskId + amount + creator + timestamp` 上鏈。

#### 前端
- [ ] CreateTaskPage：TaskForm（標題、描述、報酬金額輸入）
- [ ] 送出前顯示「將鎖定 X USDC 至合約」確認提示
- [ ] 等待交易確認的 Loading 狀態
- [ ] 交易成功後導向任務列表頁

#### 後端
- [ ] `POST /api/tasks` — 儲存任務內容（title, description, createdBy, taskId）
- [ ] `GET /api/tasks` — 回傳開放任務列表

#### 鏈上（智能合約）
- [ ] `createTask(taskId, amount)` — payable，將 USDC 鎖入合約
- [ ] emit `TaskCreated(taskId, creator, amount)` 事件
- [ ] 合約儲存：taskId → {creator, amount, status, executor}

#### 資料怎麼流動？
```
需求方填寫表單 → 點擊「發布任務」
  → 前端呼叫後端 POST /api/tasks（儲存內容）→ 取得 taskId
  → 前端呼叫合約 createTask(taskId, amount)
  → 使用者簽署交易，USDC 從錢包轉入合約
  → 合約 emit TaskCreated 事件
  → 前端監聽 tx receipt 確認 → 更新 UI，顯示任務已建立
```

#### 備註
- 依賴：C1（錢包連接）、C5（USDC 授權 approve）
- 風險：需要先呼叫 USDC 合約的 `approve()`，使用者需簽兩筆交易（approve + createTask）
- **待討論：沒收保證金（T4-4）或未完成任務的報酬，平台要分多少手續費？**

---

### 功能 T1-3 + T1-5：接取任務 + 確認完成

**這個功能在幹嘛？**
> 供給方點擊「接取」→ 任務被鎖定（其他人無法再接）→ 供給方完成後提交 → 需求方確認 → 合約自動打款給供給方。

**這筆資料需要上鏈嗎？**
> 需要。「接取」與「確認完成」是觸發資金流動的關鍵行為，必須上鏈。

#### 前端
- [ ] 任務列表頁：「接取任務」按鈕（僅開放任務可見）
- [ ] 接取後任務狀態變為「進行中」，顯示執行者地址
- [ ] 供給方：「提交成果」按鈕（輸入說明或連結）
- [ ] 需求方：「確認完成」按鈕 → 觸發合約打款

#### 後端
- [ ] `PATCH /api/tasks/:id/accept` — 記錄 executor
- [ ] `PATCH /api/tasks/:id/submit` — 儲存成果描述
- [ ] `PATCH /api/tasks/:id/complete` — 標記完成

#### 鏈上
- [ ] `acceptTask(taskId)` — 記錄 executor，任務狀態改為 InProgress
- [ ] `completeTask(taskId)` — 需求方呼叫，合約將報酬打給 executor（扣除平台費）
- [ ] `autoComplete(taskId)` — 逾期未確認（例如 7 天）自動完成（可用 Chainlink Automation 或手動觸發）

#### 資料怎麼流動？
```
供給方點「接取」
  → 合約 acceptTask(taskId) → 任務鎖定
  → 供給方完成任務，點「提交成果」→ 後端記錄
  → 需求方看到成果，點「確認完成」
  → 合約 completeTask(taskId)
  → USDC 從合約打給 executor（扣平台費）
  → UI 更新為 Completed，雙方收到通知
```

---

### 功能 T2-1：NFT 發行（供給方）

**這個功能在幹嘛？**
> 供給方（活動主辦、組織）填寫 NFT 系列資訊 → 上傳圖片 → 平台的 Factory 合約建立該系列，供給方只需簽一次交易。

**這筆資料需要上鏈嗎？**
> 需要。NFT 系列的發行紀錄與所有權必須上鏈。
> 圖片上傳至 IPFS，合約只儲存 `metadataURI`。

#### 前端
- [ ] NFT 發行表單：名稱、描述、圖片上傳、發行數量、單價（USDC）
- [ ] 圖片上傳至 IPFS（透過後端/Pinata）取得 URI
- [ ] 預覽 NFT 外觀
- [ ] 簽署交易，等待確認

#### 後端
- [ ] `POST /api/nft/collections` — 儲存系列資訊、處理圖片上傳至 IPFS
- [ ] `GET /api/nft/collections` — 回傳所有 NFT 系列列表

#### 鏈上
- [ ] ERC-1155 Factory 合約
- [ ] `createCollection(name, symbol, maxSupply, priceUSDC, metadataURI)` → 建立新系列
- [ ] emit `CollectionCreated(collectionId, issuer, maxSupply, price)` 事件

#### 資料怎麼流動？
```
供給方填寫表單 → 點擊「發行」
  → 後端上傳圖片至 IPFS → 取得 metadataURI
  → 前端呼叫合約 createCollection(...)
  → 供給方簽署（一次交易）
  → 合約建立系列，emit CollectionCreated
  → 系列出現在 NFT 市集列表
```

#### 備註
- 使用 ERC-1155（一個合約管理多個系列，節省 Gas）
- 懶鑄造：NFT 在購買時才 mint，供給方不用先付 Gas 鑄造所有份數

---

### 功能 T4-1 + T4-4：建立目標 + 結算（每日目標清單）

**這個功能在幹嘛？**
> 使用者設定目標名稱、週期、保證金金額 → 保證金鎖入合約 → 週期內完成打卡 → 週期結束自動結算：完成退款、未完成沒收。

**這筆資料需要上鏈嗎？**
> 需要。保證金的鎖定與結算必須上鏈，確保「規則透明、沒有人可以作弊」。

#### 前端
- [ ] 建立目標表單：名稱、開始日期、結束日期、每日打卡或週期打卡、保證金金額
- [ ] 鎖定保證金確認提示
- [ ] 目標進行中：顯示剩餘天數、打卡進度
- [ ] 每日打卡按鈕（每個週期只能打一次）
- [ ] 結算後顯示結果（退款/沒收）

#### 後端
- [ ] `POST /api/goals` — 儲存目標內容
- [ ] `POST /api/goals/:id/checkin` — 記錄打卡時間
- [ ] `GET /api/goals` — 取得使用者目標列表

#### 鏈上
- [ ] `createGoal(goalId, depositAmount, deadline)` — 鎖定保證金
- [ ] `checkIn(goalId)` — 記錄今日打卡（合約驗證時間戳）
- [ ] `settle(goalId)` — 結算：完成條件達成 → 退還保證金；未達成 → 沒收保證金至平台金庫
- [ ] emit `GoalSettled(goalId, owner, result, amount)` 事件

#### 資料怎麼流動？
```
使用者填寫目標 → 點「建立」
  → 合約 createGoal(goalId, amount, deadline)
  → USDC 從錢包鎖入合約
  → 每日（或週期內）點「打卡」→ 合約 checkIn(goalId) 記錄時間戳
  → 週期結束後，任何人（或自動化）呼叫 settle(goalId)
  → 合約計算完成率 → 退款或沒收
  → UI 顯示結算結果
```

#### 備註
- **待討論：沒收的保證金去哪？** 建議選項：a) 平台金庫（當收入）b) 銷毀（burn）c) 捐給指定慈善地址
- 打卡條件：用戶自訂（每天必須打卡，或週期內打卡 N 次）

---

## 4. 開發順序

```
Phase 1（MVP — 平台核心 + 主題一：任務媒介）：
  → C1 錢包連接 + WalletContext
  → C3 主題頻道導覽框架（AppLayout、Header、4個主題入口）
  → C4+C5 平台費用機制 + USDC 整合
  → T1-1 建立任務（合約 Escrow）
  → T1-2 任務列表瀏覽
  → T1-3 接取任務（合約鎖定）
  → T1-4 任務提交（後端記錄）
  → T1-5 確認完成 + 自動打款（合約）

Phase 2（主題二：NFT 採購媒介 + 主題四：每日目標清單）：
  → T2-1 NFT 發行（Factory 合約）
  → T2-2+T2-3 NFT 市集瀏覽 + 購買（懶鑄造）
  → T2-5 NFT 核銷
  → T4-1+T4-2 建立目標 + 鎖定保證金
  → T4-3 每日打卡
  → T4-4 目標結算（合約自動化）

Phase 3（主題三：餐廳即期食物 + 進階功能）：
  → T3-1 餐廳上架食物
  → T3-2+T3-3 食物列表 + 購買憑證 NFT
  → T3-4+T3-5 核銷 + 過期退款
  → T1-6 任務爭議逾期自動處理
  → T4-6 每日目標社群功能
  → C2 完整的角色管理系統
```

---

## 5. 技術架構

| 層級 | 技術選擇 | 備註 |
|------|---------|------|
| **前端框架** | React + TypeScript + Vite | 快速 HMR，型別安全 |
| **樣式** | Tailwind CSS + shadcn/ui | 符合「乾淨、卡片式」設計方針 |
| **Web3 套件** | wagmi + viem | React Hooks 封裝，對接合約最方便 |
| **狀態管理** | React Context API（Phase 1）→ Zustand（Phase 2） | 隨複雜度升級 |
| **後端框架** | Go | 已確定 |
| **資料庫** | PostgreSQL | 結構化資料（任務、用戶、NFT 系列） |
| **NFT 標準** | ERC-1155（Factory 合約） | 一合約管理多系列，節省 Gas |
| **支付代幣** | USDC（穩定幣） | 避免 ETH 價格波動影響定價 |
| **鏈** | Base | 低 Gas、Coinbase 生態、EVM 相容 |
| **合約語言** | Solidity | |
| **合約框架** | Foundry | 測試速度快，適合快速迭代 |
| **圖片/Metadata 儲存** | IPFS（透過 Pinata） | NFT metadata 去中心化存儲 |
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
  reward: number;           // USDC 金額
  status: 'Open' | 'InProgress' | 'Submitted' | 'Completed' | 'Disputed';
  creator: string;          // 需求方錢包地址
  executor: string | null;  // 供給方錢包地址
  createdAt: string;
  transactionHash?: string;
}

// NFT 系列（主題二）
export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  metadataURI: string;      // IPFS URI
  maxSupply: number;
  minted: number;
  priceUSDC: number;
  issuer: string;           // 供給方地址
  collectionType: 'Ticket' | 'Membership' | 'Credential' | 'Food';
}

// 食物品項（主題三，繼承 NFT 概念）
export interface FoodListing {
  id: string;
  restaurantName: string;
  itemName: string;
  description: string;
  priceUSDC: number;
  quantity: number;
  expiresAt: string;        // 有效期限
  nftCollectionId: string;  // 對應 NFT 系列
}

// 目標（主題四）
export interface Goal {
  id: string;
  title: string;
  depositAmount: number;    // USDC 保證金
  startDate: string;
  endDate: string;
  checkInCount: number;     // 已打卡次數
  requiredCheckIns: number; // 需要打卡總次數
  status: 'Active' | 'Completed' | 'Failed' | 'Settled';
  owner: string;            // 使用者錢包地址
}

// 錢包狀態
export interface WalletState {
  isConnected: boolean;
  address: string | null;
}
```

---

## 7. 待討論 / 未決定事項

- [ ] **平台手續費率是多少？** 建議：任務媒介 2-5%、NFT 採購 2-3%、餐廳食物 1-2%
- [ ] **每日目標沒收的保證金去哪？** 選項：a) 平台金庫 b) 銷毀 c) 捐慈善地址
- [ ] **任務逾期自動完成的天數？** 需求方幾天內未確認，自動視為完成（建議 7 天）
- [ ] **餐廳供給方需要審核嗎？** 任何人都能上架，還是需要平台 KYC？
- [ ] **NFT 購買後可以轉售嗎？** 如果可以，需要加 Marketplace 功能
- [ ] **每日目標打卡條件細節：** 週期內需全數打卡，還是達成 X% 即算成功？
- [ ] **Base 鏈上的 USDC 合約地址** 需確認（Base Mainnet vs Base Sepolia 測試網）
- [ ] **合約審計計畫：** MVP 測試網先跑，主網上線前要找人審計嗎？

---

## 8. 參考資源

- [前端架構技術規格書 (MVP 階段)](./On-chain%20Task%20Tracker%20前端架構技術規格書%20(MVP%20階段).pdf)
- [專案開發路徑圖](./Task%20Tracker%20專案開發路徑圖：從架構定義到%20MVP%20實作落地.pdf)
- wagmi 官方文件 — React Web3 Hooks
- viem 官方文件 — TypeScript Ethereum 工具庫
- OpenZeppelin ERC-1155 — NFT Factory 合約基礎
- Pinata — IPFS 圖片/Metadata 上傳服務
- Base 官方文件 — Layer 2 鏈資訊
