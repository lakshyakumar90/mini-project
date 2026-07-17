import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createJobThunk } from '@/store/slices/jobSlice';
import { Button } from '@/components/ui/button';
import { Briefcase, X } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';

const CreateJobModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'full-time',
    locationType: 'remote',
    location: '',
    description: '',
    skills: '',
    requirements: '',
    budgetMin: '',
    budgetMax: '',
    budgetCurrency: 'USD',
    budgetPeriod: 'yearly'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      setError('Title, company, and description are required');
      return;
    }
    setError(null);
    setSubmitting(true);

    const skillsArr = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const requirementsArr = formData.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const jobData = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      type: formData.type,
      locationType: formData.locationType,
      location: formData.location.trim(),
      description: formData.description.trim(),
      skills: skillsArr,
      requirements: requirementsArr,
      budget: {
        min: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        max: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        currency: formData.budgetCurrency,
        period: formData.budgetPeriod
      }
    };

    const resultAction = await dispatch(createJobThunk(jobData));
    setSubmitting(false);

    if (createJobThunk.fulfilled.match(resultAction)) {
      setFormData({
        title: '',
        company: '',
        type: 'full-time',
        locationType: 'remote',
        location: '',
        description: '',
        skills: '',
        requirements: '',
        budgetMin: '',
        budgetMax: '',
        budgetCurrency: 'USD',
        budgetPeriod: 'yearly'
      });
      onClose();
    } else {
      setError(resultAction.payload || 'Failed to create job listing');
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Post Opportunity"
      subtitle="Create a new job, gig, or open collaboration opportunity"
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className="dub-btn-outline w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="dub-btn-primary w-full sm:w-auto px-6 order-1 sm:order-2"
          >
            {submitting ? 'Posting...' : 'Publish Listing'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-inter">
        {error && (
          <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Title / Role *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="dub-input font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Company / Project *
            </label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp or OpenSource Devs"
              className="dub-input font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5]">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#171717]">Engagement Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="dub-input bg-white"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="collab">Open Source / Collab</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#171717]">Location Type</label>
            <select
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              className="dub-input bg-white"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#171717]">Location (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. SF, CA / Worldwide"
              className="dub-input bg-white"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">Compensation & Budget</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border p-3 rounded-[12px] bg-white border-[#e5e5e5]">
            <div>
              <label className="block text-[11px] font-medium text-[#737373] mb-1">Min ($)</label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                placeholder="120000"
                className="dub-input font-geist text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737373] mb-1">Max ($)</label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                placeholder="160000"
                className="dub-input font-geist text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737373] mb-1">Period</label>
              <select
                name="budgetPeriod"
                value={formData.budgetPeriod}
                onChange={handleChange}
                className="dub-input text-xs"
              >
                <option value="yearly">Per Year</option>
                <option value="monthly">Per Month</option>
                <option value="hourly">Per Hour</option>
                <option value="fixed">Fixed Project</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737373] mb-1">Currency</label>
              <input
                type="text"
                name="budgetCurrency"
                value={formData.budgetCurrency}
                onChange={handleChange}
                className="dub-input font-geist text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities, engineering culture, or project outcomes..."
            className="dub-input leading-relaxed min-h-[100px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">Required Stack / Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js, GraphQL..."
            className="dub-input font-geist"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">Key Requirements (one per line)</label>
          <textarea
            name="requirements"
            rows={3}
            value={formData.requirements}
            onChange={handleChange}
            placeholder="3+ years of production experience&#10;Familiarity with distributed tracing&#10;Excellent asynchronous communication"
            className="dub-input leading-relaxed"
          />
        </div>
      </form>
    </SlideOver>
  );
};

export default CreateJobModal;
