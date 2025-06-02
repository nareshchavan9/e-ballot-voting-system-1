
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Store a hash of IP and user agent for audit purposes
  auditHash: {
    type: String
  }
});

// Ensure a voter can only vote once per election
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
