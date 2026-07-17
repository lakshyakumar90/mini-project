const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverNote: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  resume: {
    url: { type: String, default: '' },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' }
  },
  additionalDocuments: [{
    url: { type: String, default: '' },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' }
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 150
  },
  company: {
    type: String,
    required: [true, 'Company or project name is required'],
    trim: true
  },
  companyLogo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: 5000
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'collab'],
    default: 'full-time'
  },
  locationType: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'remote'
  },
  location: {
    type: String,
    default: ''
  },
  budget: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly', 'fixed'], default: 'yearly' }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [applicationSchema],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

jobSchema.index({ createdAt: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ locationType: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
