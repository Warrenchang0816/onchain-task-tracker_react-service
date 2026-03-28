# On-chain Task Tracker — 新人上手規格書
## MVP 開發期（無登入系統）

> **版本：** v1.0
> **日期：** 2026-03-28
> **適用對象：** 前端（React）/ 後端（Go）開發者
> **前提：** 本規格書適用於「尚未整合錢包登入」的開發測試階段，所有身份以 Mock Wallet 模擬。

---

## 目錄

1. [專案概述](#1-專案概述)
2. [開發環境設定](#2-開發環境設定)
3. [專案架構總覽](#3-專案架構總覽)
4. [Mock Wallet 模擬身份系統](#4-mock-wallet-模擬身份系統)
5. [現有 API 規格（公版 Task CRUD）](#5-現有-api-規格公版-task-crud)
6. [主題一：鏈上任務媒介 API 規格（新建）](#6-主題一鏈上任務媒介-api-規格新建)
7. [資料庫 Schema](#7-資料庫-schema)
8. [測試資料 Seed Data](#8-測試資料-seed-data)
9. [前端路由規劃](#9-前端路由規劃)
10. [開發優先順序](#10-開發優先順序)
11. [程式碼慣例](#11-程式碼慣例)

---

## 1. 專案概述

On-chain Task Tracker 是一個以區塊鏈為基礎的供需媒介平台，連接「需求方」與「供給方」。
目前 MVP 階段聚焦於**主題一：任務媒介**，先把完整業務流程跑通，之後再疊加真實錢包登入與智能合約。

### 目前已完成
- 前端公版：任務列表、新增、編輯、狀態變更
- 後端公版：Task CRUD REST API（Gin + PostgreSQL）

### 本階段目標
- 擴充任務流程為「需求方發布 → 供給方接取 → 提交 → 確認完成」完整四段式
- 以 Mock Wallet 模擬不同身份進行測試
- 不動現有公版 tasks table，另建 `onchain_tasks` table

---

## 2. 開發環境設定

### 2.1 前置需求

| 工具 | 版本需求 | 安裝確認指令 |
|------|---------|-------------|
| Node.js | >= 20 | `node -v` |
| Go | >= 1.21 | `go version` |
| PostgreSQL | >= 14 | `psql --version` |
| Git | 任意 | `git --version` |

### 2.2 Clone 專案

```bash
git clone <repo-url>
cd onchain-task-tracker
```

目錄結構：
```
onchain-task-tracker/
├── react-service/   # 前端 React + TypeScript
└── go-service/      # 後端 Go + Gin
```

### 2.3 後端啟動（go-service）

```bash
cd go-service

# 1. 複製環境變數範例（首次）
cp .env.example .env   # 或直接編輯 .env

# 2. .env 內容
APP_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=TASK
DB_SSLMODE=disable

# 3. 建立資料庫
psql -U postgres -c "CREATE DATABASE \"TASK\";"

# 4. 執行 Schema（見第 7 節）
psql -U postgres -d TASK -f schema.sql

# 5. 匯入測試資料（見第 8 節）
psql -U postgres -d TASK -f seed.sql

# 6. 啟動服務
go run ./cmd/server/main.go
# 服務跑在 http://localhost:8080
```

### 2.4 前端啟動（react-service）

```bash
cd react-service

# 1. 安裝依賴
npm install

# 2. 環境變數（可選，預設已指向 localhost:8081）
# .env.local
VITE_API_BASE_URL=http://localhost:8081/api

# 3. 啟動開發伺服器
npm run dev
# 前端跑在 http://localhost:5173
```

> **注意：** docker-compose.yml 中後端 port 對外是 8081，本機直接跑是 8080。
> 前端的 `VITE_API_BASE_URL` 預設是 `http://localhost:8081/api`，
> 若直接 `go run` 啟動後端請改為 `http://localhost:8080/api`。

### 2.5 確認服務正常

```bash
# 後端健康檢查
curl http://localhost:8080/api/tasks
# 預期回傳: {"success":true,"data":[...],"message":""}

# 前端：開啟瀏覽器
open http://localhost:5173
```

---

## 3. 專案架構總覽

### 3.1 後端架構（go-service）

```
go-service/
├── cmd/server/main.go          # 程式進入點：初始化 DB、Router、啟動 Server
├── internal/
│   ├── config/config.go        # 環境變數讀取（AppPort, DB 設定）
│   ├── db/postgres.go          # PostgreSQL 連線建立
│   ├── router/router.go        # 路由定義（Gin）
│   ├── handler/                # HTTP 請求處理層（接收 Request，回傳 Response）
│   ├── service/                # 業務邏輯層
│   ├── repository/             # 資料庫操作層（SQL 查詢）
│   ├── model/                  # 資料庫資料結構（對應 DB table）
│   └── dto/                    # 傳輸物件（API 的 Request/Response 格式）
├── docker-compose.yml
├── Dockerfile
└── .env
```

**請求流程：**
```
HTTP Request
  → Router（路由分配）
    → Handler（解析 Request、組裝 Response）
      → Service（業務邏輯）
        → Repository（SQL 操作）
          → PostgreSQL
```

### 3.2 前端架構（react-service）

```
react-service/src/
├── main.tsx                    # 程式進入點
├── App.tsx                     # RouterProvider 掛載
├── router/index.tsx            # 路由定義
├── layouts/AppLayout.tsx       # 共用版型（Header + 內容區）
├── pages/                      # 頁面元件（對應路由）
├── components/
│   ├── common/                 # 共用 UI 元件
│   └── task/                   # Task 相關元件
├── api/                        # API 呼叫函式
├── types/                      # TypeScript 型別定義
└── context/                    # （待建）WalletContext
```

**資料流：**
```
Page 元件
  → api/ 函式（fetch）
    → Go 後端 REST API
      → 回傳資料更新 useState
        → 重新渲染 UI
```

---

## 4. Mock Wallet 模擬身份系統

在沒有真實錢包的開發階段，使用 **Mock Wallet** 模擬不同用戶身份。

### 4.1 預設測試帳號

| 名稱 | Mock 地址 | 角色說明 |
|------|----------|---------|
| User A | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | 主要需求方（發布任務） |
| User B | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | 主要供給方（接取任務） |
| User C | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | 備用測試帳號 |
| User D | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | 備用測試帳號 |

> 這些地址來自 Hardhat/Foundry 預設測試帳號，業界通用，方便辨識。

### 4.2 前端實作（WalletContext）

**建立 `src/context/WalletContext.tsx`：**

```tsx
import { createContext, useContext, useState, ReactNode } from 'react'

// 預設測試帳號
export const MOCK_WALLETS = [
  { label: 'User A (需求方)', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
  { label: 'User B (供給方)', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
  { label: 'User C (測試)', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
  { label: 'User D (測試)', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
]

interface WalletState {
  isConnected: boolean
  address: string | null
  connect: (address: string) => void
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(
    localStorage.getItem('mockWalletAddress')
  )

  const connect = (addr: string) => {
    localStorage.setItem('mockWalletAddress', addr)
    setAddress(addr)
  }

  const disconnect = () => {
    localStorage.removeItem('mockWalletAddress')
    setAddress(null)
  }

  return (
    <WalletContext.Provider value={{ isConnected: !!address, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
```

### 4.3 Header 改造（MockWallet 切換器）

Header 新增錢包切換下拉選單：
- 未連線：顯示「Connect Wallet」按鈕 → 點擊展開選擇 Mock 帳號
- 已連線：顯示縮寫地址（`0xf39F...2266`）+ 切換 / 斷線選項

### 4.4 後端不需要驗證

MVP 階段後端 API 接受 `wallet_address` 作為 request body 的欄位，**不做簽名驗證**。
前端把 `useWallet().address` 傳入 request 即可。
真實錢包整合後，這個欄位會由後端從簽名中解析，前端不需要大改。

---

## 5. 現有 API 規格（公版 Task CRUD）

Base URL: `http://localhost:8080/api`

> 這組 API 操作的是 `tasks` table，為公版基礎功能，維持現狀不動。

---

### GET /api/tasks

取得所有任務列表。

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "設計首頁 Banner",
      "description": "需要符合品牌色調",
      "status": "CREATED",
      "priority": "HIGH",
      "dueDate": "2026-04-01T00:00:00Z",
      "createdAt": "2026-03-28T10:00:00Z",
      "updatedAt": "2026-03-28T10:00:00Z"
    }
  ],
  "message": ""
}
```

---

### POST /api/tasks

建立新任務。

**Request Body**
```json
{
  "title": "設計首頁 Banner",
  "description": "需要符合品牌色調",
  "status": "CREATED",
  "priority": "HIGH",
  "dueDate": "2026-04-01T00:00:00Z"
}
```

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| title | string | ✅ | 任務標題 |
| description | string | ❌ | 任務描述 |
| status | string | ✅ | `CREATED` \| `COMPLETED` |
| priority | string | ✅ | `LOW` \| `MEDIUM` \| `HIGH` |
| dueDate | string (ISO8601) | ❌ | 截止日期 |

**Response**
```json
{
  "success": true,
  "message": "Task created successfully"
}
```

---

### PUT /api/tasks/:id

更新任務內容。Request Body 同 POST，所有欄位可更新。

---

### PUT /api/tasks/:id/status

僅更新任務狀態。

**Request Body**
```json
{
  "status": "archived"
}
```

> 目前用於「封存」，status 值為 `archived`。

---

## 6. 主題一：鏈上任務媒介 API 規格（新建）

> 操作 `onchain_tasks` table。
> 這組 API 實作完整的「需求方發布 → 供給方接取 → 提交 → 確認完成」四段式流程。

### 6.1 任務狀態流程圖

```
[需求方] 發布任務
        ↓
    ┌─ Open ─────────────────────────────────→ Cancelled（需求方取消，僅 Open 階段可取消）
    │
    ↓ [供給方] 接取任務
  InProgress
    │
    ↓ [供給方] 提交成果
  Submitted
    │
    ├──→ Completed（需求方確認）
    │
    └──→ InProgress（需求方退回，要求重做）← Phase 2 擴充
```

| 狀態 | 說明 |
|------|------|
| `Open` | 任務開放，等待供給方接取 |
| `InProgress` | 已被供給方接取，進行中 |
| `Submitted` | 供給方已提交成果，等待需求方確認 |
| `Completed` | 需求方已確認，任務結束 |
| `Cancelled` | 需求方取消（僅限 Open 階段） |
| `Expired` | 逾期未處理（Phase 2，由排程自動變更） |

---

### GET /api/onchain-tasks

取得任務列表，支援篩選。

**Query Parameters**

| 參數 | 說明 | 範例 |
|------|------|------|
| status | 依狀態篩選 | `?status=Open` |
| creator | 依需求方地址篩選 | `?creator=0xf39F...` |
| executor | 依供給方地址篩選 | `?executor=0x7099...` |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "幫我寫一份技術文件",
      "description": "Golang REST API 架構說明，約 2000 字",
      "rewardUsdc": 50.00,
      "status": "Open",
      "creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "executorAddress": null,
      "submissionContent": null,
      "transactionHash": null,
      "dueDate": "2026-04-10T00:00:00Z",
      "submittedAt": null,
      "completedAt": null,
      "createdAt": "2026-03-28T10:00:00Z",
      "updatedAt": "2026-03-28T10:00:00Z"
    }
  ],
  "message": ""
}
```

---

### GET /api/onchain-tasks/:id

取得單一任務詳情，Response 格式同上單筆。

---

### POST /api/onchain-tasks

需求方發布新任務。

**Request Body**
```json
{
  "title": "幫我寫一份技術文件",
  "description": "Golang REST API 架構說明，約 2000 字",
  "rewardUsdc": 50.00,
  "creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "dueDate": "2026-04-10T00:00:00Z"
}
```

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| title | string | ✅ | 任務標題（最長 255 字） |
| description | string | ❌ | 詳細描述 |
| rewardUsdc | number | ✅ | 報酬金額（USDC，最小 0.01） |
| creatorAddress | string | ✅ | 需求方 Mock 錢包地址 |
| dueDate | string (ISO8601) | ❌ | 任務截止日期 |

**Response**
```json
{
  "success": true,
  "data": { "id": 1 },
  "message": "Task created successfully"
}
```

**錯誤情況**
```json
// 400 - 缺少必填欄位
{ "success": false, "message": "title is required" }

// 400 - 報酬不得為零
{ "success": false, "message": "rewardUsdc must be greater than 0" }
```

---

### PUT /api/onchain-tasks/:id/accept

供給方接取任務（Open → InProgress）。

**Request Body**
```json
{
  "executorAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
}
```

**錯誤情況**
```json
// 409 - 任務已被接取
{ "success": false, "message": "task is no longer open" }

// 400 - 不能接取自己發布的任務
{ "success": false, "message": "creator cannot accept their own task" }
```

---

### PUT /api/onchain-tasks/:id/submit

供給方提交成果（InProgress → Submitted）。

**Request Body**
```json
{
  "executorAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "submissionContent": "文件已完成，連結：https://notion.so/xxx"
}
```

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| executorAddress | string | ✅ | 驗證是否為正確的供給方 |
| submissionContent | string | ✅ | 成果說明或連結 |

**錯誤情況**
```json
// 403 - 非此任務的供給方
{ "success": false, "message": "only the executor can submit this task" }

// 409 - 任務狀態不允許提交
{ "success": false, "message": "task is not in progress" }
```

---

### PUT /api/onchain-tasks/:id/complete

需求方確認完成（Submitted → Completed）。

**Request Body**
```json
{
  "creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

**錯誤情況**
```json
// 403 - 非此任務的需求方
{ "success": false, "message": "only the creator can complete this task" }

// 409 - 任務尚未提交
{ "success": false, "message": "task has not been submitted yet" }
```

---

### PUT /api/onchain-tasks/:id/cancel

需求方取消任務（Open → Cancelled）。

**Request Body**
```json
{
  "creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

**錯誤情況**
```json
// 409 - 任務已被接取，無法取消
{ "success": false, "message": "task cannot be cancelled after being accepted" }
```

---

## 7. 資料庫 Schema

### 7.1 現有 Table（不動）

```sql
-- 公版任務（現有，不修改）
CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  NOT NULL DEFAULT 'CREATED',
  priority    VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 7.2 新建 Table（主題一）

```sql
-- 鏈上任務媒介（新建）
CREATE TABLE IF NOT EXISTS onchain_tasks (
  id                 SERIAL PRIMARY KEY,
  title              VARCHAR(255)   NOT NULL,
  description        TEXT,
  reward_usdc        NUMERIC(18, 2) NOT NULL CHECK (reward_usdc > 0),
  status             VARCHAR(50)    NOT NULL DEFAULT 'Open',
  -- status: Open | InProgress | Submitted | Completed | Cancelled | Expired

  creator_address    VARCHAR(42)    NOT NULL,
  executor_address   VARCHAR(42),
  submission_content TEXT,
  transaction_hash   VARCHAR(66),   -- 真實上鏈後填入，MVP 階段為 null

  due_date           TIMESTAMPTZ,
  submitted_at       TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 索引（查詢優化）
CREATE INDEX idx_onchain_tasks_status          ON onchain_tasks(status);
CREATE INDEX idx_onchain_tasks_creator_address ON onchain_tasks(creator_address);
CREATE INDEX idx_onchain_tasks_executor_address ON onchain_tasks(executor_address);
```

### 7.3 自動更新 updated_at

```sql
-- 建立 trigger function（PostgreSQL）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 套用至 onchain_tasks
CREATE TRIGGER trg_onchain_tasks_updated_at
  BEFORE UPDATE ON onchain_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 8. 測試資料 Seed Data

> 可直接貼入 psql 執行，涵蓋各種狀態組合供 UI 測試使用。

```sql
-- 清空舊資料（開發時用）
TRUNCATE TABLE onchain_tasks RESTART IDENTITY;

-- ① Open 任務（可被接取）
INSERT INTO onchain_tasks (title, description, reward_usdc, status, creator_address, due_date)
VALUES
  (
    '幫我撰寫 Go REST API 技術文件',
    '需包含 API 架構說明、範例 Request/Response，約 2000 字，繁體中文。',
    50.00,
    'Open',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    NOW() + INTERVAL '7 days'
  ),
  (
    '設計 NFT 發行平台首頁 UI 稿',
    '需提供 Figma 設計稿，包含桌面版與手機版，風格參考 Opensea。',
    120.00,
    'Open',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    NOW() + INTERVAL '14 days'
  ),
  (
    '撰寫 Solidity ERC-1155 合約測試',
    '針對現有 Factory 合約補充 Foundry 單元測試，覆蓋率需達 80% 以上。',
    80.00,
    'Open',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    NOW() + INTERVAL '10 days'
  );

-- ② InProgress 任務（已被接取）
INSERT INTO onchain_tasks (title, description, reward_usdc, status, creator_address, executor_address, due_date)
VALUES
  (
    '翻譯白皮書（中文 → 英文）',
    '約 5000 字，需具備 Web3 領域知識，保留技術術語。',
    200.00,
    'InProgress',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    NOW() + INTERVAL '5 days'
  ),
  (
    '錄製平台操作教學影片',
    '5 分鐘內，涵蓋任務發布、接取、提交流程，需附字幕。',
    60.00,
    'InProgress',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    NOW() + INTERVAL '3 days'
  );

-- ③ Submitted 任務（等待需求方確認）
INSERT INTO onchain_tasks (title, description, reward_usdc, status, creator_address, executor_address, submission_content, submitted_at, due_date)
VALUES
  (
    '建立社群媒體貼文範本',
    '需包含 Twitter、Discord 各 5 則，配合平台發布風格。',
    30.00,
    'Submitted',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '已完成所有範本，Google Docs 連結：https://docs.google.com/xxx',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '2 days'
  );

-- ④ Completed 任務（已完成）
INSERT INTO onchain_tasks (title, description, reward_usdc, status, creator_address, executor_address, submission_content, submitted_at, completed_at, due_date)
VALUES
  (
    'Logo 設計（SVG 格式）',
    '需提供三種配色版本，符合 Web3 平台調性。',
    150.00,
    'Completed',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '設計稿已上傳至 Figma，連結：https://figma.com/xxx，三種配色版本均已完成。',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '5 days'
  );

-- ⑤ Cancelled 任務（已取消）
INSERT INTO onchain_tasks (title, description, reward_usdc, status, creator_address, due_date)
VALUES
  (
    '撰寫競品分析報告',
    '分析三個主要競品平台的功能、用戶數、代幣機制。',
    40.00,
    'Cancelled',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    NOW() - INTERVAL '2 days'
  );
```

### 8.1 各狀態測試情境對應表

| 狀態 | 測試情境 | 操作帳號 |
|------|---------|---------|
| Open（3筆） | 驗證列表顯示、接取按鈕是否依身份顯示 | User A 看到自己發的不能接；User B 可以接 |
| InProgress（2筆） | 驗證提交功能、進行中狀態顯示 | User B 可以提交；User A 只能看 |
| Submitted（1筆） | 驗證需求方確認功能 | User A 可以確認；User B 只能看 |
| Completed（1筆） | 驗證歷史紀錄顯示 | 所有人唯讀 |
| Cancelled（1筆） | 驗證已取消狀態顯示 | 所有人唯讀 |

---

## 9. 前端路由規劃

### 9.1 現有路由（維持）

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | HomePage | 儀表板（顯示公版 tasks 摘要） |
| `/tasks` | TaskListPage | 公版 Task 列表管理 |
| `/createTask` | TaskCreatePage | 公版 Task 建立（目前空殼） |

### 9.2 新增路由（主題一）

| 路徑 | 頁面（待建） | 說明 |
|------|-------------|------|
| `/onchain-tasks` | OnchainTaskListPage | 鏈上任務列表（依身份顯示可操作按鈕） |
| `/onchain-tasks/new` | OnchainTaskCreatePage | 需求方發布新任務 |
| `/onchain-tasks/:id` | OnchainTaskDetailPage | 任務詳情 + 操作（接取/提交/確認） |

### 9.3 頁面行為規格

#### OnchainTaskListPage
- 預設顯示所有 `Open` 任務
- 篩選 Tab：全部 / Open / InProgress / Submitted / Completed / 我發布的 / 我接取的
- 每張 TaskCard 依當前 Mock Wallet 身份顯示不同操作按鈕：

| 身份 | 任務狀態 | 顯示按鈕 |
|------|---------|---------|
| 需求方（creator） | Open | 取消任務 |
| 需求方（creator） | Submitted | 確認完成 |
| 供給方（其他人） | Open | 接取任務 |
| 供給方（executor） | InProgress | 提交成果 |
| 任何人 | Completed / Cancelled | 無按鈕（唯讀） |

#### OnchainTaskDetailPage
- 顯示完整任務資訊
- 顯示 `submissionContent`（若已提交）
- 依身份顯示操作區塊

---

## 10. 開發優先順序

### Phase 1-A：後端 API（建議先完成後端再做前端）

```
Week 1
  ① 建立 onchain_tasks table（schema.sql）
  ② 實作 Model / DTO
     - OnchainTask model
     - CreateOnchainTaskRequest / OnchainTaskResponse DTO
  ③ 實作 Repository
     - FindAll / FindByID / Create / UpdateStatus 方法
  ④ 實作 Service
     - GetTasks / CreateTask / AcceptTask / SubmitTask / CompleteTask / CancelTask
     - 包含狀態驗證邏輯（非法狀態轉換回傳錯誤）
  ⑤ 實作 Handler + 注冊路由
  ⑥ 用 curl / Postman 手動測試所有 API
```

### Phase 1-B：前端開發

```
Week 2
  ① 建立 WalletContext + useWallet Hook
  ② 改造 Header（加入 Mock Wallet 切換器）
  ③ 建立 onchainTaskApi.ts（API 呼叫函式）
  ④ 建立 OnchainTaskListPage
     - 任務列表 + 狀態篩選
     - 依身份顯示操作按鈕
  ⑤ 建立 OnchainTaskCreatePage
     - 發布表單（標題、描述、報酬、截止日）
  ⑥ 建立 OnchainTaskDetailPage
     - 完整資訊顯示
     - 接取 / 提交 / 確認 / 取消 操作
  ⑦ 更新 Header 導覽連結
```

### Phase 1-C：整合測試

```
Week 3（各主題負責人）
  ① 匯入 Seed Data，用不同 Mock 帳號走完完整流程：
     User A 發布 → User B 接取 → User B 提交 → User A 確認
  ② 確認各狀態顯示正確
  ③ 確認錯誤情況有適當提示（不能接自己的任務等）
  ④ Code Review
```

---

## 11. 程式碼慣例

### 11.1 後端（Go）

```go
// 檔名：snake_case
// onchain_task_handler.go
// onchain_task_service.go
// onchain_task_repository.go

// Struct 名稱：PascalCase
type OnchainTask struct { ... }
type CreateOnchainTaskRequest struct { ... }
type OnchainTaskResponse struct { ... }

// 方法名稱：動詞 + 名詞
func (s *OnchainTaskService) AcceptTask(id int, executorAddress string) error { ... }

// 錯誤統一用 errors.New() 或 fmt.Errorf()，不要 panic
// 狀態碼：
//   200 成功
//   400 請求格式錯誤或業務規則不符
//   403 身份不符（不是正確的 creator/executor）
//   404 資源不存在
//   409 狀態衝突（任務已被接取等）
//   500 系統錯誤
```

### 11.2 前端（React/TypeScript）

```typescript
// 檔名：PascalCase（元件）/ camelCase（api、utils）
// OnchainTaskListPage.tsx
// onchainTaskApi.ts

// 型別定義集中在 types/
// types/onchainTask.ts
export type OnchainTaskStatus =
  'Open' | 'InProgress' | 'Submitted' | 'Completed' | 'Cancelled' | 'Expired'

export interface OnchainTask {
  id: number
  title: string
  description: string
  rewardUsdc: number
  status: OnchainTaskStatus
  creatorAddress: string
  executorAddress: string | null
  submissionContent: string | null
  transactionHash: string | null
  dueDate: string | null
  submittedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// API 函式放在 api/onchainTaskApi.ts
// 命名規則：動詞 + 名詞
export const getOnchainTasks = async (params?: {...}) => { ... }
export const createOnchainTask = async (payload: CreateOnchainTaskPayload) => { ... }
export const acceptOnchainTask = async (id: number, executorAddress: string) => { ... }
export const submitOnchainTask = async (id: number, payload: SubmitTaskPayload) => { ... }
export const completeOnchainTask = async (id: number, creatorAddress: string) => { ... }
export const cancelOnchainTask = async (id: number, creatorAddress: string) => { ... }
```

### 11.3 狀態顯示色彩規範

| 狀態 | 色彩 | Tailwind Class 參考 |
|------|------|-------------------|
| Open | 藍色 | `bg-blue-100 text-blue-700` |
| InProgress | 黃色 | `bg-yellow-100 text-yellow-700` |
| Submitted | 紫色 | `bg-purple-100 text-purple-700` |
| Completed | 綠色 | `bg-green-100 text-green-700` |
| Cancelled | 灰色 | `bg-gray-100 text-gray-500` |
| Expired | 紅色 | `bg-red-100 text-red-500` |

---

## 附錄：快速參考

### 常用 curl 指令

```bash
# 取得所有開放任務
curl http://localhost:8080/api/onchain-tasks?status=Open

# 發布新任務（User A）
curl -X POST http://localhost:8080/api/onchain-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "測試任務",
    "description": "這是測試",
    "rewardUsdc": 10.00,
    "creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "dueDate": "2026-04-30T00:00:00Z"
  }'

# 接取任務（User B 接取 id=1 的任務）
curl -X PUT http://localhost:8080/api/onchain-tasks/1/accept \
  -H "Content-Type: application/json" \
  -d '{"executorAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}'

# 提交成果（User B）
curl -X PUT http://localhost:8080/api/onchain-tasks/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "executorAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "submissionContent": "成果連結：https://example.com/result"
  }'

# 確認完成（User A）
curl -X PUT http://localhost:8080/api/onchain-tasks/1/complete \
  -H "Content-Type: application/json" \
  -d '{"creatorAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}'
```

### Mock Wallet 地址速查

```
User A: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  ← 主要需求方
User B: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8  ← 主要供給方
User C: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC  ← 備用
User D: 0x90F79bf6EB2c4f870365E785982E1f101E93b906  ← 備用
```
