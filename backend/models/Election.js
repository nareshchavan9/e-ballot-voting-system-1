const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true
  }
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    required: true
  },
  candidates: [candidateSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for election state based on current date
electionSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'completed';
  return 'active';
});

// Ensure candidates have unique IDs
electionSchema.pre('save', function(next) {
  if (this.isModified('candidates')) {
    this.candidates.forEach(candidate => {
      if (!candidate._id) {
        candidate._id = new mongoose.Types.ObjectId();
      }
    });
  }
  next();
});

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
