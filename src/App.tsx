import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Marketplace from "./pages/Marketplace";
import NFTTasksPage from "./pages/NFT-TasksPage";
import TaskListPage from "./pages/TaskListPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import BlockchainLogsPage from "./pages/BlockchainLogsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TaskListPage />} />
      <Route path="/tasks/:id" element={<TaskDetailPage />} />
      <Route path="/nft-tasks" element={<NFTTasksPage />} />
      <Route path="/blockchain-logs" element={<BlockchainLogsPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  );
}