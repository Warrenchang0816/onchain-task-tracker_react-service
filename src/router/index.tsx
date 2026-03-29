import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
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
]);

export default router;
