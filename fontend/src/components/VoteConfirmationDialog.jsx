import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VoteConfirmationDialog = ({
  isOpen,
  onClose,
  selectedCandidate,
  candidates,
  onSubmit,
  isSubmitting
}) => {
  const selectedCandidateDetails = candidates.find(c => c.id === selectedCandidate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            You are about to cast your vote for this election. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {selectedCandidateDetails && (
          <div className="py-4">
            <p className="font-medium">
              Selected Candidate: {selectedCandidateDetails.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCandidateDetails.party}
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
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
  );
};

export default VoteConfirmationDialog; 