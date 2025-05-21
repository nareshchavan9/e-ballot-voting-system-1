import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CandidateList = ({ candidates, selectedCandidate, onSelect }) => {
  return (
    <RadioGroup 
      value={selectedCandidate || ""} 
      onValueChange={onSelect} 
      className="space-y-4"
    >
      {candidates.map(candidate => (
        <div 
          key={candidate.id} 
          className="flex items-start space-x-2 rounded-md border p-4 hover:bg-gray-50"
        >
          <RadioGroupItem value={candidate.id} id={candidate.id} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={candidate.id}
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
  );
};

export default CandidateList; 