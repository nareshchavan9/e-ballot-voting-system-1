import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter, // Import createBrowserRouter
  RouterProvider,     // Import RouterProvider
  // Routes, Route, Navigate are no longer directly used here with createBrowserRouter
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import CreateElection from "./pages/CreateElection";

const queryClient = new QueryClient();

// Define your routes using the createBrowserRouter configuration object
const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/admin/create-election", element: <CreateElection /> },
    { path: "/admin/manage-election/:id", element: <AdminDashboard /> }, // Consider if this should be a different component or pass a prop
    { path: "/admin/results/:id", element: <Results /> },
    { path: "/vote/:id", element: <Vote /> },
    { path: "/results/:id", element: <Results /> }, // Note: You have two /results/:id routes, one admin, one not. Ensure this is intended.
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      // Opt-in to the new relative splat path behavior
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Use RouterProvider instead of BrowserRouter and Routes */}
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;