// import TaskForm from "../components/task/TaskForm";
import AppLayout from "../layouts/AppLayout";

const TaskCreatePage = () => {
    return (
        <AppLayout>
            <section className="page-section">
                <div className="page-heading">
                    <h1>Create Task</h1>
                    <p>Define a new task that can later be recorded on-chain.</p>
                </div>

                {/* <TaskForm /> */}
            </section>
        </AppLayout>
    );
};

export default TaskCreatePage;