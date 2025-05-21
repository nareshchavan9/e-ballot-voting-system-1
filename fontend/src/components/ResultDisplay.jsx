import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResultDisplay = ({ 
  results, 
  isLoading, 
  onRetry 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading results...</span>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load results. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Election Results</h2>
      <p className="text-gray-700 mb-6">
        Total votes cast: {results.totalVotes}
      </p>
      
      <div className="space-y-6">
        {results.results.map((result, index) => (
          <div key={result.candidate.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {index === 0 && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                )}
                <span className="font-medium">{result.candidate.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {result.candidate.party}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {result.votes} votes
              </span>
            </div>
            <Progress 
              value={(result.votes / results.totalVotes) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay; 