import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPostThunk } from '@/store/slices/postSlice';
import postService from '@/services/postService';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Code2, X, PlusCircle, Users, Rocket, Sparkles, Image as ImageIcon, ExternalLink } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'cpp',
  'html',
  'css',
  'json',
  'sql',
  'bash'
];

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [type, setType] = useState('update');
  const [tagsInput, setTagsInput] = useState('');
  const [openToCollab, setOpenToCollab] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const res = await postService.uploadPostImage(file);
      setImageUrl(res.imageUrl);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }
    setError(null);
    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const postData = {
      content: content.trim(),
      codeSnippet: showCodeSnippet && code.trim() ? { code: code.trim(), language } : { code: '', language: 'javascript' },
      type,
      tags,
      openToCollab,
      image: imageUrl
    };

    const resultAction = await dispatch(createPostThunk(postData));
    setSubmitting(false);

    if (createPostThunk.fulfilled.match(resultAction)) {
      // Reset form and close
      setContent('');
      setShowCodeSnippet(false);
      setCode('');
      setTagsInput('');
      setOpenToCollab(false);
      setImageUrl('');
      onClose();
    } else {
      setError(resultAction.payload || 'Failed to create post');
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Create Post"
      subtitle="Share your updates, code snippets, and projects with the network"
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className="dub-btn-outline w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="dub-btn-primary w-full sm:w-auto px-6 order-1 sm:order-2"
          >
            {submitting ? 'Posting...' : 'Post to Network'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-center space-x-3 p-3.5 rounded-[12px] bg-secondary border border-border shadow-subtle">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-satoshi font-bold">{user?.name?.[0] || 'D'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-satoshi font-semibold text-sm text-foreground">{user?.name || 'Developer'}</p>
            <p className="text-xs text-muted-foreground font-inter">Posting to Developer Network</p>
          </div>
        </div>

        {/* Post Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setType('update')}
              className={`py-2.5 px-3 rounded-[8px] text-xs font-medium flex items-center justify-center transition-all ${
                type === 'update'
                  ? 'dub-btn-primary shadow-subtle'
                  : 'dub-btn-outline bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              General Update
            </button>
            <button
              type="button"
              onClick={() => setType('project')}
              className={`py-2.5 px-3 rounded-[8px] text-xs font-medium flex items-center justify-center transition-all ${
                type === 'project'
                  ? 'bg-[#2563eb] text-white border border-[#2563eb] shadow-subtle'
                  : 'dub-btn-outline bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Project Showcase
            </button>
            <button
              type="button"
              onClick={() => setType('collab')}
              className={`py-2.5 px-3 rounded-[8px] text-xs font-medium flex items-center justify-center transition-all ${
                type === 'collab'
                  ? 'bg-[#16a34a] text-white border border-[#16a34a] shadow-subtle'
                  : 'dub-btn-outline bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Looking for Collab
            </button>
          </div>
        </div>

        {/* Content Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isMobile
                ? "What are you building right now?..."
                : "What are you building? Share architectural insights, code snippets, or project demonstrations..."
            }
            rows={isMobile ? 3 : 5}
            className="dub-input font-inter leading-relaxed min-h-[75px] sm:min-h-[140px] text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-3.5 w-full max-w-full resize-y"
          />
        </div>

        {/* Attachments Toggle Area */}
        <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-secondary border border-border">
          <div className="flex items-center gap-4 flex-wrap">
            {!showCodeSnippet && (
              <button
                type="button"
                onClick={() => setShowCodeSnippet(true)}
                className="flex items-center text-xs font-medium text-[#2563eb] hover:underline"
              >
                <Code2 className="w-4 h-4 mr-1.5" /> Attach Code Snippet
              </button>
            )}

            <label className="flex items-center text-xs font-medium text-[#7c3aed] hover:underline cursor-pointer">
              <ImageIcon className="w-4 h-4 mr-1.5" />
              {uploadingImage ? 'Uploading image...' : imageUrl ? 'Change Image' : 'Attach Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </div>
          {(showCodeSnippet || imageUrl) && (
            <span className="text-[11px] text-muted-foreground font-geist">Attachments active</span>
          )}
        </div>

        {/* Code Snippet Box */}
        {showCodeSnippet && (
          <div className="dub-card border border-border rounded-[12px] overflow-hidden bg-card space-y-3 p-3.5 shadow-subtle">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <span className="text-xs font-semibold flex items-center text-foreground font-geist">
                <Code2 className="w-3.5 h-3.5 mr-1.5 text-[#2563eb]" /> Code Snippet
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="dub-input py-1 px-2.5 text-xs font-geist w-auto inline-block"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCodeSnippet(false)}
                  className="text-muted-foreground hover:text-red-500 text-xs font-medium px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here (syntax highlighted cleanly in the developer feed)..."
              rows={6}
              className="dub-input w-full p-3 text-xs font-geist font-mono leading-relaxed min-h-[130px]"
            />
          </div>
        )}

        {/* Image Preview Box */}
        {imageUrl && (
          <div className="relative rounded-[12px] overflow-hidden border border-border my-3 w-full">
            <img src={imageUrl} alt="Uploaded post preview" className="w-full h-auto max-h-[420px] object-cover block" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white p-1.5 rounded-full transition-colors shadow-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Twitter/X-style Link Preview Card */}
        {(() => {
          const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
          if (!urlMatch) return null;
          const url = urlMatch[0];
          let domain = '';
          try { domain = new URL(url).hostname.replace('www.', ''); } catch (e) { domain = url; }
          return (
            <div className="rounded-[12px] overflow-hidden border border-border bg-secondary/80 p-3.5 space-y-1.5 shadow-subtle flex items-center justify-between gap-3">
              <div className="overflow-hidden space-y-1 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-geist">
                  <ExternalLink className="h-3 w-3 text-[#2563eb] shrink-0" />
                  <span className="truncate">{domain}</span>
                </div>
                <p className="font-satoshi font-semibold text-sm text-foreground truncate">{url}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 font-inter">Twitter/X Link Preview Card • Resource anchor will be clickable in feed</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                <ExternalLink className="h-4 w-4 text-[#2563eb]" />
              </div>
            </div>
          );
        })()}

        {/* Tags & Collab */}
        <div className="grid grid-cols-1 gap-4 pt-3 border-t border-border">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tech Stack Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, Node.js, ML, Go, Redis..."
              className="dub-input font-geist text-xs sm:text-sm py-2"
            />
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-[10px] bg-secondary border border-border">
            <input
              type="checkbox"
              id="openToCollab"
              checked={openToCollab}
              onChange={(e) => setOpenToCollab(e.target.checked)}
              className="rounded border-border text-[#2563eb] focus:ring-[#2563eb] w-4 h-4 accent-[#2563eb]"
            />
            <label htmlFor="openToCollab" className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1.5 flex-wrap">
              Flag this post as <span className="text-[#16a34a] font-semibold flex items-center gap-1"><Sparkles className="h-3 w-3 inline" />Open to Collab</span> / looking for contributors
            </label>
          </div>
        </div>
      </form>
    </SlideOver>
  );
};

export default CreatePostModal;
