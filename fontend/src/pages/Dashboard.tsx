import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, User, CheckCircle2, Vote } from "lucide-react";
import { electionService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

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
  hasVoted?: boolean;
  userVote?: {
    candidateId: string;
    candidateName: string;
    candidateParty: string;
  };
};

const ElectionCard = ({ election }: { election: Election }) => {
  const navigate = useNavigate();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getButtonText = () => {
    if (election.hasVoted) {
      return "View Your Vote";
    }
    if (election.status === "completed") {
      return "View Results";
    }
    if (election.status === "active") {
      return "Cast Vote";
    }
    return "View Details";
  };

  const handleButtonClick = () => {
    navigate(`/elections/${election._id}`);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{election.title}</CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {election.hasVoted && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Voted
              </Badge>
            )}
            {getStatusBadge(election.status)}
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2">{election.description}</CardDescription>
        {election.hasVoted && election.userVote && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Vote className="h-4 w-4 mr-2 text-green-500" />
              Voted for {election.userVote.candidateName} ({election.userVote.candidateParty})
            </span>
          </div>
        )}
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
        </div>
      </CardContent>
      <CardFooter className="flex-none mt-auto pt-4">
        <Button 
          className="w-full"
          onClick={handleButtonClick}
          variant={election.hasVoted ? "outline" : "default"}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Dashboard = () => {
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

  const updateElectionStatus = (election: Election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now > endDate) {
      return { ...election, status: "completed" };
    } else if (now >= startDate && now <= endDate) {
      return { ...election, status: "active" };
    } else {
      return { ...election, status: "upcoming" };
    }
  };

  useEffect(() => {
    fetchElections();
    // Set up an interval to check election status every minute
    const interval = setInterval(fetchElections, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      const data = await electionService.getElections();
      
      // Check voting status for each election and update their status
      const electionsWithVoteStatus = await Promise.all(
        data.map(async (election) => {
          try {
            const voteStatus = await electionService.checkVoteStatus(election._id);
            const updatedElection = updateElectionStatus(election);
            return {
              ...updatedElection,
              hasVoted: voteStatus.hasVoted,
              userVote: voteStatus.hasVoted ? {
                candidateId: voteStatus.voteId,
                candidateName: voteStatus.candidateName,
                candidateParty: voteStatus.candidateParty
              } : undefined
            };
          } catch (error) {
            console.error(`Error checking vote status for election ${election._id}:`, error);
            const updatedElection = updateElectionStatus(election);
            return {
              ...updatedElection,
              hasVoted: false
            };
          }
        })
      );
      
      setElections(electionsWithVoteStatus);
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
    // In a real application, clear authentication state here
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
            <h1 className="text-2xl font-bold text-blue-600">E-Ballot Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
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
          <h2 className="text-2xl font-semibold mb-2">Welcome, Voter</h2>
          <p className="text-gray-600">Here are the elections available to you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <ElectionCard key={election._id} election={election} />
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Your Voting History</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {elections.filter(e => e.hasVoted).length > 0 ? (
              <div className="divide-y">
                {elections.filter(e => e.hasVoted).map(election => (
                  <div key={election._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{election.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {election.userVote ? (
                            <span className="flex items-center">
                              <Vote className="h-4 w-4 mr-2 text-green-500" />
                              Voted for {election.userVote.candidateName} ({election.userVote.candidateParty})
                            </span>
                          ) : (
                            "Vote recorded"
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-gray-600">
                        {formatDate(election.endDate)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>You haven't participated in any elections yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
