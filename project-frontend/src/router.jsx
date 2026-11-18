import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/Dashboard";
import Projects from "./views/Projects"; // Import ចូល
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import ProjectForm from "./views/ProjectForm";
import ProjectDetails from "./views/ProjectDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/projects", // Route សម្រាប់បង្ហាញបញ្ជី Project
        element: <Projects />,
      },
      {
        path: "/projects/new",
        element: <ProjectForm />,
      },
      {
        path: "/projects/new",
        element: <ProjectForm key="projectCreate" />,
      },
      {
        path: "/projects/:id",
        element: <ProjectForm key="projectUpdate" />,
      },
      {
          path: '/projects/:id/details',
          element: <ProjectDetails />
      }
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
