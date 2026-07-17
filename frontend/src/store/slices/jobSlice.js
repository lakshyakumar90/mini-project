import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobService from '@/services/jobService';

export const fetchJobsThunk = createAsyncThunk(
  'jobs/fetchJobs',
  async ({ cursor = null, limit = 12, type = 'all', locationType = 'all', skills = null, search = '', append = false }, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobs({ cursor, limit, type, locationType, skills, search });
      return { ...response, append };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const createJobThunk = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await jobService.createJob(jobData);
      return response.job;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job listing');
    }
  }
);

export const fetchJobByIdThunk = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobById(jobId);
      return response.job;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job details');
    }
  }
);

export const applyToJobThunk = createAsyncThunk(
  'jobs/applyToJob',
  async ({ jobId, coverNote, resume, additionalDocuments }, { rejectWithValue }) => {
    try {
      const response = await jobService.applyToJob(jobId, { coverNote, resume, additionalDocuments });
      return { jobId, applicationsCount: response.applicationsCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply to job');
    }
  }
);

export const updateApplicationStatusThunk = createAsyncThunk(
  'jobs/updateApplicationStatus',
  async ({ jobId, applicationId, status }, { rejectWithValue }) => {
    try {
      await jobService.updateApplicationStatus(jobId, applicationId, status);
      return { applicationId, status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update application status');
    }
  }
);

export const deleteJobThunk = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobService.deleteJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job listing');
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  nextCursor: null,
  hasMore: true,
  loading: false,
  loadingMore: false,
  error: null,
  filters: {
    type: 'all',
    locationType: 'all',
    search: '',
    skills: null
  }
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.jobs = [];
      state.nextCursor = null;
      state.hasMore = true;
    },
    resetJobFilters: (state) => {
      state.filters = initialState.filters;
      state.jobs = [];
      state.nextCursor = null;
      state.hasMore = true;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchJobsThunk
      .addCase(fetchJobsThunk.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchJobsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        if (action.payload.append) {
          state.jobs = [...state.jobs, ...action.payload.jobs];
        } else {
          state.jobs = action.payload.jobs;
        }
        state.nextCursor = action.payload.pagination.nextCursor;
        state.hasMore = action.payload.pagination.hasMore;
      })
      .addCase(fetchJobsThunk.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // createJobThunk
      .addCase(createJobThunk.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      // fetchJobByIdThunk
      .addCase(fetchJobByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // applyToJobThunk
      .addCase(applyToJobThunk.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j._id === action.payload.jobId);
        if (job) {
          job.hasApplied = true;
          job.applicationsCount = action.payload.applicationsCount;
        }
        if (state.currentJob && state.currentJob._id === action.payload.jobId) {
          state.currentJob.hasApplied = true;
          state.currentJob.applicationsCount = action.payload.applicationsCount;
        }
      })
      // updateApplicationStatusThunk
      .addCase(updateApplicationStatusThunk.fulfilled, (state, action) => {
        if (state.currentJob && Array.isArray(state.currentJob.applications)) {
          const app = state.currentJob.applications.find(a => a._id === action.payload.applicationId);
          if (app) {
            app.status = action.payload.status;
          }
        }
      })
      // deleteJobThunk
      .addCase(deleteJobThunk.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j._id !== action.payload);
        if (state.currentJob && state.currentJob._id === action.payload) {
          state.currentJob = null;
        }
      });
  }
});

export const { setJobFilters, resetJobFilters, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
