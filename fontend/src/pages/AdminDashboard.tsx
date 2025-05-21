import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, User, Plus, BarChart2 } from "lucide-react";
import { electionService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      const data = await electionService.getElections();
      setElections(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load elections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin authentication state
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome, Admin</h2>
          <p className="text-gray-600">Manage your elections and view results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <ElectionCard key={election._id} election={election} />
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Election Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Elections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{elections.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Elections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {elections.filter(e => e.status === "active").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed Elections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {elections.filter(e => e.status === "completed").length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 