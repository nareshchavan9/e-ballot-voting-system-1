import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Info, User, Loader2, Vote } from "lucide-react";
import { electionService, authService } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Candidate = {
  _id: string;
  name: string;
  party: string;
  bio: string;
};

type Election = {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  candidates: Candidate[];
};

const ElectionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);

    const fetchElection = async () => {
      if (!id) {
        setError("Election ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await electionService.getElectionDetails(id);
        setElection(data);

        // Check if user has voted in this election
        if (isAuthenticated) {
          try {
            const voteStatus = await electionService.checkVoteStatus(id);
            setHasVoted(voteStatus.hasVoted);
          } catch (err) {
            console.error("Failed to check vote status:", err);
          }
        }

        // If election is completed, fetch results
        if (data.status === "completed") {
          setIsLoadingResults(true);
          try {
            const resultsData = await electionService.getElectionResults(id);
            setResults(resultsData);
          } catch (err) {
            console.error("Failed to fetch results:", err);
          } finally {
            setIsLoadingResults(false);
          }
        }
      } catch (error: any) {
        setError(error.message || "Failed to load election details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [id, isAuthenticated]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !election || !id) {
      toast({
        title: "Error",
        description: "Invalid election or candidate selection",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(false);
    setIsSubmitting(true);

    try {
      console.log('Submitting vote:', {
        electionId: id,
        candidateId: selectedCandidate
      });

      // Submit vote
      await electionService.submitVote(id, selectedCandidate);
      
      // Update local state
      setHasVoted(true);
      
      // Show success message
      toast({
        title: "Vote submitted successfully!",
        description: "Thank you for participating in this election.",
      });
      
      // Refresh election data
      const updatedElection = await electionService.getElectionDetails(id);
      if (updatedElection) {
        setElection(updatedElection);
        
        // If election is now completed, fetch results
        if (updatedElection.status === "completed") {
          setIsLoadingResults(true);
          try {
            const resultsData = await electionService.getElectionResults(id);
            setResults(resultsData);
          } catch (err) {
            console.error("Failed to fetch results:", err);
          } finally {
            setIsLoadingResults(false);
          }
        }
      }
      
      // Navigate after successful vote and data refresh
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error('Vote submission error:', err);
      const errorMessage = err.response?.data?.message || "Failed to submit your vote. Please try again.";
      toast({
        title: "Vote submission failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If error is due to already voted, update local state
      if (err.response?.status === 400 && errorMessage.includes("already voted")) {
        setHasVoted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to cast your vote",
        variant: "destructive",
      });
      navigate("/login", { state: { message: "Please log in to cast your vote" } });
      return;
    }
    setShowConfirmDialog(true);
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Election Results</h2>
          {results.isMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Mock Data
            </Badge>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Votes:</span>
            <span className="font-semibold">{results.totalVotes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-semibold">
              {new Date(results.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>

        {results.isMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              This is mock data generated for testing purposes. Real results will be shown when votes are cast.
            </p>
          </div>
        )}

        {results.isTie && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              This election resulted in a tie between {results.winners.length} candidates!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.results.map((result: any) => (
            <div 
              key={result.candidate.id}
              className={`p-4 rounded-lg border ${
                results.winners.some((w: any) => w.id === result.candidate.id)
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{result.candidate.name}</h3>
                  <p className="text-sm text-gray-600">{result.candidate.party}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{result.votes} votes</div>
                  <div className="text-sm text-gray-600">
                    {result.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Election not found"}</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isActive = election.status === "active";
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
        
        <main className="container mx-auto px-4 md:px-6 py-8">
          {election && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-2xl">{election.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {formatDate(election.startDate)} - {formatDate(election.endDate)}
                      </CardDescription>
                    </div>
                    <Badge variant={election.status === "active" ? "default" : "secondary"}>
                      {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">About this election</h2>
                    <p className="text-gray-700 mb-6">{election.description}</p>
                    
                    {election.status === "completed" ? (
                      isLoadingResults ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Loading results...</p>
                        </div>
                      ) : (
                        renderResults()
                      )
                    ) : election.status === "active" ? (
                      hasVoted ? (
                        <div className="text-center py-8">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center justify-center mb-4">
                              <div className="bg-blue-100 rounded-full p-3">
                                <Vote className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Vote Has Been Recorded</h3>
                            <p className="text-blue-700">
                              You have already cast your vote in this election. Thank you for participating!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
                          <p className="text-gray-700 mb-6">
                            Select one candidate from the list below. Your vote is confidential and secure.
                          </p>
                          {isAuthenticated ? (
                            <div className="space-y-4">
                              <RadioGroup value={selectedCandidate || ""} onValueChange={setSelectedCandidate} className="space-y-4">
                                {election.candidates.map(candidate => (
                                  <div key={candidate._id} className="flex items-start space-x-2 rounded-md border p-4 hover:bg-gray-50">
                                    <RadioGroupItem value={candidate._id} id={candidate._id} />
                                    <div className="grid gap-1.5 leading-none">
                                      <label
                                        htmlFor={candidate._id}
                                        className="text-lg font-medium cursor-pointer flex items-center"
                                      >
                                        {candidate.name}
                                        <span className="ml-2 text-sm text-blue-600 font-normal">
                                          {candidate.party}
                                        </span>
                                      </label>
                                      <p className="text-sm text-gray-500">
                                        {candidate.bio}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </RadioGroup>
                              <Button
                                className="w-full mt-4"
                                disabled={!selectedCandidate || isSubmitting}
                                onClick={handleVoteClick}
                              >
                                {isSubmitting ? "Submitting..." : "Cast Vote"}
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-600 mb-4">Please log in to cast your vote</p>
                              <Button onClick={() => navigate("/login", { state: { message: "Please log in to cast your vote" } })}>
                                Log In to Vote
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
        {!isActive && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Candidates</h2>
              <div className="space-y-6">
                {election.candidates.map(candidate => (
                  <div key={candidate._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-1">
                      <User className="h-5 w-5 mr-2 text-gray-400" />
                      <h3 className="font-medium">{candidate.name}</h3>
                      <span className="ml-2 text-sm text-blue-600">
                        {candidate.party}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm pl-7">{candidate.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Are you sure you want to vote for {election.candidates.find(c => c._id === selectedCandidate)?.name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="py-4">
              <p className="font-medium">Selected Candidate:</p>
              <p className="mt-1">
                {election.candidates.find(c => c._id === selectedCandidate)?.name} 
                <span className="text-sm text-gray-600 ml-2">
                  ({election.candidates.find(c => c._id === selectedCandidate)?.party})
                </span>
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVoteSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm Vote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionDetails;