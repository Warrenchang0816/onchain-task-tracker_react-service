import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import TaskListPage from "../pages/TaskListPage";
import TaskDetailPage from "../pages/TaskDetailPage";
import BlockchainLogsPage from "../pages/BlockchainLogsPage";
import MerchantKYCPage from "../pages/MerchantKYCPage";
import OrderManagementPage from "../pages/OrderManagementPage";
import MerchantProductsPage from "../pages/MerchantProductsPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import PlatformCoinPage from "../pages/PlatformCoinPage";
import CustomerRegisterPage from "../pages/CustomerRegisterPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/tasks",
        element: <TaskListPage />,
    },
    {
        path: "/products",
        element: <TaskListPage />,
    },
    {
        path: "/tasks/:id",
        element: <TaskDetailPage />,
    },
    {
        path: "/logs",
        element: <BlockchainLogsPage />,
    },
    {
        path: "/merchant/kyc",
        element: <MerchantKYCPage />,
    },
    {
        path: "/merchant/products",
        element: <MerchantProductsPage />,
    },
    {
        path: "/merchant/orders",
        element: <OrderManagementPage />,
    },
    {
        path: "/orders/:orderId",
        element: <OrderDetailPage />,
    },
    {
        path: "/customer/history",
        element: <OrderHistoryPage />,
    },
    {
        path: "/my/coins",
        element: <PlatformCoinPage />,
    },
    {
        path: "/customer/register",
        element: <CustomerRegisterPage />,
    },
]);

export default router;
