import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import TaskCreatePage from "../pages/TaskCreatePage";
import TaskListPage from "../pages/TaskListPage";

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
        path: "/createTask",
        element: <TaskCreatePage />,
    },
]);

export default router;