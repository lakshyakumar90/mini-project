const Job = require('../models/Job');
const mongoose = require('mongoose');
const { notifyUser } = require('./notificationController');
const { getFileUrl } = require('../middleware/upload');

// @desc    Get paginated/filtered jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const { cursor, limit = 12, type, locationType, skills, search } = req.query;
    const limitNum = Math.min(parseInt(limit) || 12, 30);

    const filter = { status: 'open' };

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (locationType && locationType !== 'all') {
      filter.locationType = locationType;
    }
    if (skills && skills.trim() !== '') {
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) {
        filter.skills = { $in: skillsArr };
      }
    }
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex }
      ];
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const jobs = await Job.find(filter)
      .sort({ _id: -1 })
      .limit(limitNum)
      .populate('postedBy', 'name email profilePicture role location');

    const nextCursor = jobs.length === limitNum ? jobs[jobs.length - 1]._id : null;

    // Transform jobs to include hasApplied flag and application count for current user
    const transformedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      jobObj.applicationsCount = job.applications.length;
      jobObj.hasApplied = job.applications.some(a => a.applicant.toString() === req.user._id.toString());
      delete jobObj.applications; // Don't send application details in list view
      return jobObj;
    });

    res.status(200).json({
      success: true,
      jobs: transformedJobs,
      pagination: {
        nextCursor,
        hasMore: jobs.length === limitNum
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a new job/gig/collab listing
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    const { title, company, companyLogo, description, requirements, skills, type, locationType, location, budget } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ success: false, message: 'Title, company, and description are required' });
    }

    let processedSkills = [];
    if (Array.isArray(skills)) processedSkills = skills.map(s => s.trim()).filter(Boolean);
    else if (typeof skills === 'string') processedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

    let processedRequirements = [];
    if (Array.isArray(requirements)) processedRequirements = requirements.map(r => r.trim()).filter(Boolean);
    else if (typeof requirements === 'string') processedRequirements = requirements.split('\n').map(r => r.trim()).filter(Boolean);

    const newJob = await Job.create({
      title: title.trim(),
      company: company.trim(),
      companyLogo: companyLogo || req.user.profilePicture || '',
      description: description.trim(),
      requirements: processedRequirements,
      skills: processedSkills,
      type: type || 'full-time',
      locationType: locationType || 'remote',
      location: location || '',
      budget: budget || {},
      postedBy: req.user._id
    });

    const populatedJob = await Job.findById(newJob._id)
      .populate('postedBy', 'name email profilePicture role location');

    const jobObj = populatedJob.toObject();
    jobObj.applicationsCount = 0;
    jobObj.hasApplied = false;
    delete jobObj.applications;

    res.status(201).json({
      success: true,
      job: jobObj
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profilePicture role location githubUsername bio')
      .populate('applications.applicant', 'name email profilePicture role skills location githubUsername githubUrl bio');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    const isOwner = job.postedBy._id.toString() === req.user._id.toString();
    const jobObj = job.toObject();
    jobObj.applicationsCount = job.applications.length;
    jobObj.hasApplied = job.applications.some(a => a.applicant && a.applicant._id.toString() === req.user._id.toString());
    jobObj.isOwner = isOwner;

    // If not owner, strip other applications
    if (!isOwner) {
      delete jobObj.applications;
    }

    res.status(200).json({
      success: true,
      job: jobObj
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private
const applyToJob = async (req, res) => {
  try {
    const { coverNote } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This job listing is closed' });
    }

    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job listing' });
    }

    const alreadyApplied = job.applications.some(a => a.applicant.toString() === req.user._id.toString());
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this position' });
    }

    // Handle resume file (single file)
    const resumeFile = req.files?.resume?.[0];
    const resumeData = resumeFile ? {
      url: getFileUrl(resumeFile, 'documents'),
      filename: resumeFile.filename,
      originalName: resumeFile.originalname
    } : { url: '', filename: '', originalName: '' };

    // Handle additional documents (multiple files)
    const additionalFiles = req.files?.additionalDocuments || [];
    const additionalDocuments = additionalFiles.map(file => ({
      url: getFileUrl(file, 'documents'),
      filename: file.filename,
      originalName: file.originalname
    }));

    job.applications.push({
      applicant: req.user._id,
      coverNote: coverNote ? coverNote.trim() : '',
      resume: resumeData,
      additionalDocuments,
      status: 'pending',
      appliedAt: new Date()
    });

    await job.save();

    notifyUser({
      recipient: job.postedBy,
      sender: req.user._id,
      type: 'job_application',
      entityId: job._id,
      entityModel: 'Job',
      message: `Applied to your listing: "${job.title}"`
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      applicationsCount: job.applications.length
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update job status or application status
// @route   PUT /api/jobs/:id/application/:applicationId/status
// @access  Private
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the job poster can update application status' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      applicationId: req.params.applicationId,
      status
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(job._id);

    res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully',
      jobId: req.params.id
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
  getJobById,
  applyToJob,
  updateApplicationStatus,
  deleteJob
};
