import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { applyToJobThunk } from '@/store/slices/jobSlice';
import { Button } from '@/components/ui/button';
import { X, Send, CheckCircle2, FileText, XCircle, Upload, Paperclip } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ADDITIONAL_FILES = 5;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only PDF, DOC, and DOCX files are allowed';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 10MB';
  }
  return null;
};

const FileUpload = ({ label, accept, multiple, maxFiles, value, onChange, error, helpText }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    }

    if (maxFiles && validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      validFiles.splice(maxFiles);
    }

    if (errors.length > 0) {
      onChange(null, errors.join('; '));
      return;
    }

    if (multiple) {
      onChange(validFiles, null);
    } else if (validFiles.length > 0) {
      onChange(validFiles[0], null);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = '';
  };

  const removeFile = (index) => {
    const newFiles = [...value].filter((_, i) => i !== index);
    onChange(newFiles, null);
  };

  const removeSingleFile = () => {
    onChange(null, null);
  };

  const displayFiles = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">{label}</label>
      
      <div
        className={`relative border-2 rounded-[12px] p-4 transition-all ${dragActive ? 'border-[#171717] bg-[#f5f5f5]' : 'border-[#e5e5e5]'} ${displayFiles.length > 0 ? 'bg-[#fafafa]' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={label.toLowerCase().replace(/\s+/g, '-')}
        />
        
        {displayFiles.length === 0 ? (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-[#a3a3a3] mb-2" />
            <p className="text-sm font-medium text-[#171717] mb-1">
              {multiple ? 'Drag & drop files here, or click to select' : 'Drag & drop your resume, or click to select'}
            </p>
            <p className="text-xs text-[#737373]">
              {helpText || `Supported formats: PDF, DOC, DOCX (max 10MB${multiple ? `, up to ${maxFiles} files` : ''})`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-[#e5e5e5] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#a3a3a3]" />
                  <div>
                    <p className="text-sm font-medium text-[#171717] truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-[#737373]">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => multiple ? removeFile(index) : removeSingleFile()}
                  className="p-1 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
            {displayFiles.length < (maxFiles || 1) && (
              <button
                type="button"
                onClick={() => document.getElementById(label.toLowerCase().replace(/\s+/g, '-')).click()}
                className="w-full py-2 text-sm font-medium text-[#171717] border border-dashed border-[#e5e5e5] rounded-[8px] hover:border-[#171717] hover:bg-[#f5f5f5] transition-colors"
              >
                <Paperclip className="w-4 h-4 inline mr-1.5" />
                Add another file
              </button>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const ApplyJobModal = ({ isOpen, onClose, job }) => {
  const [coverNote, setCoverNote] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalDocsError, setAdditionalDocsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeError || additionalDocsError) return;
    setError(null);
    setSubmitting(true);

    const resultAction = await dispatch(
      applyToJobThunk({
        jobId: job._id,
        coverNote,
        resume: resumeFile,
        additionalDocuments: additionalFiles,
      })
    );
    setSubmitting(false);

    if (applyToJobThunk.fulfilled.match(resultAction)) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCoverNote('');
        setResumeFile(null);
        setAdditionalFiles([]);
        onClose();
      }, 1500);
    } else {
      setError(resultAction.payload || 'Failed to submit application');
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${job.company}`}
      subtitle="Submit your application directly to the project maintainers"
      size="md"
      footer={
        !success && (
          <>
            <button type="button" onClick={onClose} disabled={submitting} className="dub-btn-outline">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="dub-btn-primary px-5"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {submitting ? 'Sending...' : 'Submit Application'}
            </button>
          </>
        )
      }
    >
      {success ? (
        <div className="p-8 text-center space-y-3 bg-[#f5f5f5] dark:bg-secondary/40 rounded-[16px] border border-border">
          <CheckCircle2 className="w-12 h-12 text-[#16a34a] mx-auto animate-bounce" />
          <h4 className="font-satoshi font-semibold text-lg text-foreground">Application Submitted!</h4>
          <p className="text-xs text-muted-foreground font-inter">The job poster has been notified with your cover note, attached documents, and a direct link to your developer profile.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 font-inter">
          {error && (
            <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-4 rounded-[12px] bg-secondary/60 border border-border">
            <p className="font-satoshi font-semibold text-base text-foreground">{job.title}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize font-inter">
              {job.type} • {job.locationType} {job.location ? `• ${job.location}` : ''}
            </p>
          </div>

          <FileUpload
            label="Resume / CV (.pdf, .doc, .docx) - Optional"
            accept=".pdf,.doc,.docx"
            multiple={false}
            value={resumeFile}
            onChange={(file, err) => { setResumeFile(file); setResumeError(err); }}
            error={resumeError}
            helpText="Upload your resume in PDF, DOC, or DOCX format (max 10MB)"
          />

          <FileUpload
            label="Additional Documents (Optional - up to 5)"
            accept=".pdf,.doc,.docx"
            multiple={true}
            maxFiles={MAX_ADDITIONAL_FILES}
            value={additionalFiles}
            onChange={(files, err) => { setAdditionalFiles(files || []); setAdditionalDocsError(err); }}
            error={additionalDocsError}
            helpText="Supporting documents: portfolio, certificates, specs (max 5 files, 10MB each)"
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cover Note / Why are you a strong fit? (Optional)
            </label>
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Briefly introduce yourself, mention relevant architecture decisions, or link to specific GitHub repositories..."
              rows={5}
              className="dub-input leading-relaxed min-h-[120px]"
            />
          </div>
        </form>
      )}
    </SlideOver>
  );
};

export default ApplyJobModal;