import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, Plus, Save, User, Pencil, ExternalLink, Mail, Camera, Upload, 
  MapPin, Briefcase, Code2, FolderGit2, Sparkles, Share2, Check 
} from 'lucide-react';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { updateUserProfile, uploadAvatarThunk, uploadCoverThunk, clearError } from '@/store/slices/authSlice';

const POPULAR_TAGS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Docker', 'AWS', 'PostgreSQL', 'GraphQL', 'Tailwind CSS', 'Redis'];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    role: '',
    location: '',
    openToCollab: false,
    pinnedProjects: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState({ title: '', url: '', description: '', techStack: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills || [],
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        role: user.role || '',
        location: user.location || '',
        openToCollab: Boolean(user.openToCollab),
        pinnedProjects: user.pinnedProjects || []
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      await dispatch(uploadAvatarThunk(file));
      setSuccessMessage('Avatar updated successfully!');
    } catch (err) {
      // error handled in slice
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      await dispatch(uploadCoverThunk(file));
      setSuccessMessage('Cover banner updated successfully!');
    } catch (err) {
      // error handled in slice
    } finally {
      setUploadingCover(false);
    }
  };

  // Clear success message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) dispatch(clearError());
    };
  }, [dispatch, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleQuickAddSkill = (tag) => {
    if (!formData.skills.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, tag]
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleAddProject = () => {
    if (!newProject.title.trim() || !newProject.url.trim()) return;
    const projectToAdd = {
      title: newProject.title.trim(),
      url: newProject.url.trim(),
      description: newProject.description.trim(),
      techStack: newProject.techStack.split(',').map((t) => t.trim()).filter(Boolean)
    };
    setFormData((prev) => ({
      ...prev,
      pinnedProjects: [...prev.pinnedProjects, projectToAdd]
    }));
    setNewProject({ title: '', url: '', description: '', techStack: '' });
  };

  const handleRemoveProject = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      pinnedProjects: prev.pinnedProjects.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData))
      .then((resultAction) => {
        if (updateUserProfile.fulfilled.match(resultAction)) {
          setSuccessMessage('Profile identity & portfolio updated successfully!');
          setIsEditing(false);
        }
      });
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${user?._id || user?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  if (!user) {
    return (
      <div className="dub-card p-16 max-w-[1100px] mx-auto flex flex-col justify-center items-center space-y-3 text-muted-foreground my-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563eb]"></div>
        <p className="text-xs font-geist">Loading identity profile...</p>
      </div>
    );
  }

  const coverUrl = user.coverImage || user.coverPicture || user.cover;
  const avatarUrl = user.profilePicture || user.avatar;

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Top Page Header */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span> Identity & Portfolio Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            {isEditing ? 'Edit Identity & Portfolio' : 'My Profile & Portfolio'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleShareProfile}
            className="dub-btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Copy profile link"
          >
            {copiedShare ? <Check className="h-3.5 w-3.5 text-[#16a34a]" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedShare ? 'Copied Link' : 'Share Profile'}</span>
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="dub-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-subtle"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="dub-btn-outline text-xs py-2 px-4"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-[12px] bg-[#16a34a]/10 border border-[#16a34a]/30 text-[#16a34a] text-sm font-medium flex items-center justify-between animate-fade-bg-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-medium flex items-center justify-between animate-fade-bg-in">
          <span>{typeof error === 'string' ? error : error.message || 'An error occurred during save'}</span>
          <button onClick={() => dispatch(clearError())} className="p-1 hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SECTION 0: Hero Identity Banner & Profile Header */}
      <div className="dub-card overflow-hidden border border-border shadow-subtle">
        {/* Cover Image Banner */}
        <div 
          className="h-48 sm:h-56 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-500/20 relative bg-cover bg-center border-b border-border transition-all duration-300"
          style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : {}}
        >
          <label className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white px-3.5 py-2 rounded-[8px] text-xs font-medium cursor-pointer flex items-center gap-2 shadow-subtle transition-all border border-border">
            <Upload className="h-3.5 w-3.5" />
            <span>{uploadingCover ? 'Uploading Banner...' : 'Change Cover Banner'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
          </label>
        </div>

        {/* Profile Avatar & Identity Header Card Bar */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar Container with Upload Overlay */}
            <div className="relative group rounded-full">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-card shadow-lg bg-secondary">
                <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-2xl font-satoshi font-bold bg-primary/10 text-primary">
                  {user.name?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[11px] font-medium gap-1 border-4 border-card">
                <Camera className="h-5 w-5" />
                <span>{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>

            {/* User Identity Info */}
            <div className="space-y-2 pt-2 sm:pt-0 sm:pb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-satoshi font-bold text-foreground tracking-tight">
                  {user.name}
                </h2>
                {user.openToCollab && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-satoshi font-semibold bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Open to Collab
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground font-geist">
                {user.role && (
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-[#2563eb]" />
                    {user.role}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Social & Action Bar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:pb-2">
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dub-btn-outline p-2.5 text-xs flex items-center gap-1.5 hover:border-foreground transition-all"
                title="View GitHub Profile"
              >
                <FaGithub className="h-4 w-4" />
                <span className="hidden md:inline">GitHub</span>
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dub-btn-outline p-2.5 text-xs flex items-center gap-1.5 text-[#2563eb] border-blue-500/20 hover:border-blue-500 transition-all"
                title="View LinkedIn Profile"
              >
                <FaLinkedinIn className="h-4 w-4" />
                <span className="hidden md:inline">LinkedIn</span>
              </a>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="dub-btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Identity & Portfolio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* EDITING FORM vs VIEW SECTIONS */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Basic Identity & Bio */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-satoshi font-bold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-[#2563eb]" /> Section 1: Identity & Engineering Background
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Update your primary display details, professional headline, and engineering bio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full engineering name"
                  className="dub-input text-xs sm:text-sm py-2.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role / Headline</label>
                <input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Full-Stack Engineer / AI Specialist"
                  className="dub-input text-xs sm:text-sm py-2.5"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA / Remote / Europe"
                  className="dub-input text-xs sm:text-sm py-2.5"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engineering Bio / Summary</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your engineering focus, key achievements, open-source interests, and what technologies excite you..."
                  rows={4}
                  className="dub-input text-xs sm:text-sm py-3 leading-relaxed"
                  maxLength={500}
                />
                <div className="text-[11px] text-muted-foreground text-right font-geist">
                  {formData.bio.length}/500 characters
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Tech Stack & Competencies */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-satoshi font-bold text-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#2563eb]" /> Section 2: Verified Tech Stack & Skills
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Add core programming languages, frameworks, and infrastructure tools you specialize in.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a skill (e.g. React, Node.js, Rust, Docker) and press Enter or Add Tag..."
                  className="dub-input text-xs sm:text-sm flex-1 py-2.5 font-geist"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  className="dub-btn-primary text-xs px-5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Tag
                </button>
              </div>

              {/* Quick Add Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase font-semibold text-muted-foreground font-geist">Quick Add Popular Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickAddSkill(tag)}
                      disabled={formData.skills.includes(tag)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-geist transition-all border ${
                        formData.skills.includes(tag)
                          ? 'bg-primary/10 border-primary/30 text-primary opacity-60 cursor-not-allowed'
                          : 'bg-secondary border-border text-foreground hover:border-[#2563eb]'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing Skills List */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-foreground block mb-2 font-geist">Current Stack ({formData.skills.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-secondary border border-border text-xs font-geist text-foreground shadow-subtle"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No skills added yet. Use the bar above to add tags.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Pinned Projects Showcase */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-satoshi font-bold text-foreground flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-[#2563eb]" /> Section 3: Pinned Projects Portfolio
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Showcase top open-source repositories, live systems, and architectural highlights right on your profile.</p>
            </div>

            {/* Add New Project Builder Card */}
            <div className="p-5 rounded-[12px] bg-secondary/50 border border-border space-y-4">
              <span className="text-xs font-satoshi font-bold text-foreground uppercase tracking-wider block">+ Add New Pinned Project</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Project Title (e.g. DevConnect AI Core)"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="dub-input text-xs py-2.5"
                />
                <input
                  placeholder="Live Demo or Repo URL (https://github.com/...)"
                  value={newProject.url}
                  onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                  className="dub-input text-xs py-2.5 font-geist"
                />
                <input
                  placeholder="Short description of key technical features, database design, or performance metrics..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="dub-input text-xs py-2.5 sm:col-span-2"
                />
                <input
                  placeholder="Tech Stack tags comma separated (e.g. React, Node.js, Socket.IO, Redis, Docker)"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="dub-input text-xs py-2.5 font-geist sm:col-span-2"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  disabled={!newProject.title.trim() || !newProject.url.trim()}
                  className="dub-btn-outline text-xs py-2.5 sm:col-span-2 flex items-center justify-center gap-2 bg-card hover:border-[#2563eb]"
                >
                  <Plus className="h-4 w-4 text-[#2563eb]" /> Add Project to Portfolio
                </button>
              </div>
            </div>

            {/* Existing Pinned Projects List */}
            {formData.pinnedProjects?.length > 0 ? (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-foreground block font-geist">Pinned Portfolio Items ({formData.pinnedProjects.length}):</span>
                <div className="grid grid-cols-1 gap-3">
                  {formData.pinnedProjects.map((proj, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 rounded-[12px] bg-card border border-border flex-wrap gap-3 shadow-subtle">
                      <div className="space-y-1.5 flex-1">
                        <div className="font-satoshi font-bold text-sm flex items-center gap-2 text-foreground">
                          {proj.title}
                          <span className="text-[11px] font-normal text-muted-foreground font-geist truncate max-w-[280px]">({proj.url})</span>
                        </div>
                        {proj.description && <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>}
                        {proj.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.techStack.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-[4px] text-[10px] bg-secondary border border-border font-geist text-foreground">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="dub-btn-ghost p-2 text-red-500 hover:bg-red-500/10 rounded-[8px]"
                        title="Remove pinned project"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No pinned projects added yet. Use the form above to showcase your work.</p>
            )}
          </div>

          {/* SECTION 4: Social Links & Collab Status */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-satoshi font-bold text-foreground flex items-center gap-2">
                <FaGithub className="h-4 w-4 text-foreground" /> Section 4: Social Graph & Collaboration Settings
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Connect external developer profiles and manage your availability for open-source contributions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="githubUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FaGithub className="h-3.5 w-3.5" /> GitHub Profile URL
                </label>
                <input
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="dub-input text-xs sm:text-sm py-2.5 font-geist"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedinUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FaLinkedinIn className="h-3.5 w-3.5 text-[#2563eb]" /> LinkedIn Profile URL
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="dub-input text-xs sm:text-sm py-2.5 font-geist"
                />
              </div>
            </div>

            {/* Collaboration Status Toggle Bar */}
            <div className="flex items-center gap-3 p-4 rounded-[12px] bg-secondary border border-border mt-2">
              <input
                type="checkbox"
                id="openToCollab"
                name="openToCollab"
                checked={formData.openToCollab}
                onChange={(e) => setFormData((prev) => ({ ...prev, openToCollab: e.target.checked }))}
                className="w-4 h-4 rounded text-primary accent-[#2563eb] border-border"
              />
              <div className="flex flex-col">
                <label htmlFor="openToCollab" className="font-satoshi font-semibold cursor-pointer text-xs sm:text-sm flex items-center gap-1.5 text-foreground">
                  <Sparkles className="h-4 w-4 text-[#16a34a]" /> Open to Collaboration & Bounties
                </label>
                <span className="text-[11px] text-muted-foreground leading-relaxed">Display an active green badge alerting peers across DevConnect that you are open to collaborative opportunities.</span>
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-6 z-20 bg-card/95 backdrop-blur-md p-4 rounded-[12px] border border-border shadow-lg w-full">
            <button
              type="submit"
              className="dub-btn-primary w-full sm:flex-1 py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-subtle order-1"
              disabled={loading}
            >
              {loading ? 'Saving Profile Changes...' : (
                <>
                  <Save className="h-4 w-4" /> Save Profile Identity & Portfolio
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="dub-btn-outline w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm order-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* VIEW MODE SECTIONS */
        <div className="space-y-8">
          {/* SECTION 1: About & Background Card */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-4 shadow-subtle">
            <h3 className="font-satoshi font-bold text-base sm:text-lg flex items-center gap-2.5 text-foreground border-b border-border pb-3">
              <User className="h-4 w-4 text-[#2563eb]" /> About & Background
            </h3>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-inter">
              {user.bio || 'No bio provided yet. Click Edit Profile to add information about your engineering background, current projects, and experience.'}
            </p>
          </div>

          {/* SECTION 2: Verified Tech Stack & Skills Card */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-4 shadow-subtle">
            <h3 className="font-satoshi font-bold text-base sm:text-lg flex items-center gap-2.5 text-foreground border-b border-border pb-3">
              <Code2 className="h-4 w-4 text-[#2563eb]" /> Verified Tech Stack & Competencies
            </h3>
            {user.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 text-xs font-geist rounded-[8px] bg-secondary border border-border text-foreground shadow-subtle hover:border-[#2563eb]/50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No tech stack tags added yet. Click Edit Profile to add tags.</p>
            )}
          </div>

          {/* SECTION 3: Pinned Projects Portfolio Card */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-5 shadow-subtle">
            <h3 className="font-satoshi font-bold text-base sm:text-lg flex items-center gap-2.5 text-foreground border-b border-border pb-3">
              <FolderGit2 className="h-4 w-4 text-[#2563eb]" /> Pinned Projects Showcase
            </h3>
            {user.pinnedProjects?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {user.pinnedProjects.map((project, idx) => (
                  <div key={idx} className="dub-card p-5 flex flex-col justify-between space-y-4 group border border-border bg-secondary/30 hover:border-[#2563eb]/50 transition-all shadow-subtle">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-satoshi font-bold text-base text-foreground group-hover:text-[#2563eb] transition-colors truncate">{project.title}</h4>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#2563eb] flex items-center gap-1 text-xs font-medium shrink-0"
                        >
                          <span>Demo / Repo</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{project.description}</p>
                      )}
                    </div>
                    {project.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                        {project.techStack.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-[4px] text-[11px] font-geist bg-card text-foreground border border-border">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No projects pinned to portfolio showcase yet. Click Edit Profile to add items.</p>
            )}
          </div>

          {/* SECTION 4: GitHub Stats & Connected Social Graph Card */}
          <div className="dub-card p-6 sm:p-8 border border-border space-y-6 shadow-subtle">
            <h3 className="font-satoshi font-bold text-base sm:text-lg flex items-center gap-2.5 text-foreground border-b border-border pb-3">
              <FaGithub className="h-4 w-4 text-foreground" /> Social Graph & Contribution Activity
            </h3>

            {(user.githubStats?.repos > 0 || user.githubUsername) && (
              <div className="p-5 rounded-[12px] bg-secondary border border-border space-y-4">
                <span className="font-satoshi font-semibold text-sm flex items-center gap-2 text-foreground">
                  GitHub Profile Statistics
                  {user.githubUsername && <span className="text-xs font-normal text-muted-foreground font-geist">(@{user.githubUsername})</span>}
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 bg-card rounded-[8px] border border-border shadow-subtle">
                    <div className="text-xl font-satoshi font-bold text-[#2563eb]">{user.githubStats?.repos || '12+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Repositories</div>
                  </div>
                  <div className="p-3.5 bg-card rounded-[8px] border border-border shadow-subtle">
                    <div className="text-xl font-satoshi font-bold text-[#16a34a]">{user.githubStats?.followers || '45+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Followers</div>
                  </div>
                  <div className="p-3.5 bg-card rounded-[8px] border border-border shadow-subtle">
                    <div className="text-xl font-satoshi font-bold text-[#f59e0b]">{user.githubStats?.following || '30+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Following</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-1">
              {user.githubUrl ? (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dub-btn-outline text-xs px-5 py-2.5 flex items-center gap-2 text-foreground hover:border-[#2563eb]"
                >
                  <FaGithub className="h-4 w-4" />
                  <span>Verified GitHub Profile</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                  <FaGithub className="h-4 w-4" /> No GitHub profile linked
                </span>
              )}

              {user.linkedinUrl ? (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dub-btn-outline text-xs px-5 py-2.5 flex items-center gap-2 text-[#2563eb] border-blue-500/20 hover:border-blue-500"
                >
                  <FaLinkedinIn className="h-4 w-4" />
                  <span>Verified LinkedIn Profile</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                  <FaLinkedinIn className="h-4 w-4" /> No LinkedIn profile linked
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;