import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CandidateList from "./CandidateList";

const VoteForm = ({ 
  candidates, 
  selectedCandidate, 
  onSelect, 
  onSubmit, 
  isSubmitting 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
      <p className="text-gray-700 mb-6">
        Select one candidate from the list below. Your vote is confidential and secure.
      </p>
      
      <CandidateList 
        candidates={candidates}
        selectedCandidate={selectedCandidate}
        onSelect={onSelect}
      />
      
      <div className="mt-8">
        <Button
          onClick={onSubmit}
          disabled={!selectedCandidate || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Vote"
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoteForm; 