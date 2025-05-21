// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import CreateElection from "./pages/CreateElection";
// Import any layout components if you use them

const router = createBrowserRouter(
  [
    // If you have a main App layout (with navbars, sidebars etc.),
    // you would typically define it as a parent route here.
    // For simplicity, I'm keeping the direct page elements.
    // Example with a layout:
    // {
    //   element: <AppLayout />, // Your main layout component
    //   children: [
    //     { path: "/", element: <Index /> },
    //     { path: "/login", element: <Login /> },
    //     // ... other routes
    //     { path: "*", element: <NotFound /> },
    //   ]
    // }
    { path: "/", element: <Index /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/admin/create-election", element: <CreateElection /> },
    { path: "/admin/manage-election/:id", element: <AdminDashboard /> },
    { path: "/admin/results/:id", element: <Results /> },
    { path: "/vote/:id", element: <Vote /> },
    { path: "/results/:id", element: <Results /> },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export default router;