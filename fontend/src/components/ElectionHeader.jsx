import { Calendar, Clock } from "lucide-react";

const ElectionHeader = ({ election, formatDate }) => {
  return (
    <div className="bg-blue-600 text-white p-6">
      <h1 className="text-2xl font-bold">{election.title}</h1>
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(election.startDate)} - {formatDate(election.endDate)}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {election.status === "upcoming" ? "Opens soon" : 
             election.status === "active" ? "Voting in progress" : 
             "Voting closed"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ElectionHeader; 