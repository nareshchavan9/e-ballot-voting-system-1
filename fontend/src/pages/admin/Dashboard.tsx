import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, User, Plus, BarChart2, Trash2 } from "lucide-react";
import { electionService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Election = {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  candidates: Array<{
    _id: string;
    name: string;
    party: string;
  }>;
};

const ElectionCard = ({ election, onDelete }: { election: Election; onDelete: (id: string) => void }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{election.title}</CardTitle>
          <Badge variant={election.status === "active" ? "default" : "secondary"}>
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="mt-2 line-clamp-2">{election.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-none">
        <div className="text-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Start Date:</span>
            <span className="font-medium">{formatDate(election.startDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">End Date:</span>
            <span className="font-medium">{formatDate(election.endDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Candidates:</span>
            <span className="font-medium">{election.candidates.length}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-none mt-auto pt-4">
        <div className="flex gap-2 w-full">
          <Button 
            className="flex-1 bg-sky-300 hover:bg-sky-400 text-white"
            onClick={() => navigate(`/admin/elections/${election._id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onDelete(election._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  
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

  const handleDeleteClick = (electionId: string) => {
    setSelectedElectionId(electionId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedElectionId) return;

    try {
      const response = await electionService.deleteElection(selectedElectionId);
      console.log('Delete response:', response);
      
      toast({
        title: "Success",
        description: `Election deleted successfully. ${response.deletedVotesCount} votes were removed.`,
      });
      
      // Refresh the elections list
      await fetchElections();
    } catch (error: any) {
      console.error('Delete error:', error);
      
      const errorMessage = error.response?.data?.message || "Failed to delete election";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedElectionId(null);
    }
  };

  const handleLogout = () => {
    // Clear admin authentication state
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate("/");
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
            <ElectionCard 
              key={election._id} 
              election={election} 
              onDelete={handleDeleteClick}
            />
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Election</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this election? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard; 
