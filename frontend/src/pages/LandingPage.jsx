import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { submitContactMessage } from '@/services/contactService';
import {
  Users,
  Search,
  MessageSquare,
  ArrowRight,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Code2,
  GitPullRequest,
  Sparkles,
  ShieldCheck,
  Layers,
  Globe,
  TrendingUp,
  Briefcase,
  Cpu,
  HelpCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthChecking, user } = useSelector((state) => state.auth);

  // Mockup preview interactive state
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('💡 Suggestion');

  // Contact form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    if (isAuthenticated && !isAuthChecking && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [isAuthenticated, isAuthChecking, user]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: null });
    try {
      const res = await submitContactMessage({
        ...formData,
        type: selectedCategory,
        subject: selectedCategory
      });
      setFormStatus({ loading: false, success: true, error: null });
      setFormData((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setFormStatus({
        loading: false,
        success: false,
        error: err.message || 'Failed to send message. Please verify server email setup.'
      });
    }
  };

  if (isAuthChecking) {
    return <LoadingSpinner />;
  }

  // Mockup data for live interactive preview
  const previewDevelopers = {
    active: [
      {
        name: 'Alex Rivera',
        role: 'Senior Distributed Systems Engineer',
        stack: ['Go', 'Rust', 'Kubernetes', 'gRPC'],
        status: 'Available for Hire',
        avatar: 'AR'
      },
      {
        name: 'Elena Rostova',
        role: 'Full-Stack Architect & AI Researcher',
        stack: ['React', 'Next.js', 'Python', 'PyTorch'],
        status: 'Open to Co-founding',
        avatar: 'ER'
      },
      {
        name: 'Marcus Vance',
        role: 'Core Frontend & Design Systems Lead',
        stack: ['TypeScript', 'Tailwind', 'SvelteKit', 'GraphQL'],
        status: 'Hackathon Ready',
        avatar: 'MV'
      }
    ],
    hackathon: [
      {
        name: 'Siddharth Mehta',
        role: 'AI & Web3 Product Builder',
        stack: ['Solidity', 'Next.js', 'LangChain', 'PostgreSQL'],
        status: 'Building Side-Project',
        avatar: 'SM'
      },
      {
        name: 'Chiyeon Kim',
        role: 'Real-time Infrastructure Engineer',
        stack: ['WebSockets', 'Elixir', 'Redis', 'Docker'],
        status: 'Hackathon Ready',
        avatar: 'CK'
      }
    ],
    opensource: [
      {
        name: 'Sarah Jenkins',
        role: 'Open Source Maintainer & Rust Developer',
        stack: ['Rust', 'C++', 'WebAssembly', 'Linux Kernel'],
        status: 'Reviewing PRs',
        avatar: 'SJ'
      },
      {
        name: 'David Chen',
        role: 'Database Kernel & Performance Specialist',
        stack: ['C', 'Go', 'RocksDB', 'Distributed Systems'],
        status: 'Mentoring',
        avatar: 'DC'
      }
    ]
  };

  const currentDevs = previewDevelopers[activeTab] || previewDevelopers.active;

  return (
    <div className="min-h-screen bg-background text-foreground font-inter selection:bg-[#2563eb]/15 selection:text-[#2563eb]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-border dub-bg-dots">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Floating Feature Pills Stack */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
            <div className="dub-pill shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-[#ea580c]"></span>
              <span className="font-semibold text-foreground">Skill-Based Search</span>
            </div>
            <div className="dub-pill shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
              <span className="font-semibold text-foreground">Real-time Sockets</span>
            </div>
            <div className="dub-pill shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
              <span className="font-semibold text-foreground">Zero Algorithmic Noise</span>
            </div>
          </div>

          {/* Hero Headline Stack */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="font-satoshi text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.08]">
              Connect with developers who actually ship.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DevConnect is a clean, focused professional network held together by hairline borders and high-signal data. Discover developers by tech stack, collaborate with clear intent, and chat instantly without noise.
            </p>
            
            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
                <button className="dub-btn-dark w-full sm:w-auto px-6 py-3 text-base shadow-sm">
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </Link>
              <Link to={isAuthenticated ? "/jobs" : "/login"} className="w-full sm:w-auto">
                <button className="dub-btn-outline w-full sm:w-auto px-6 py-3 text-base">
                  {isAuthenticated ? 'Explore Jobs & Bounties' : 'Sign in to Account'}
                </button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Built for engineering teams, hackathons, open-source maintainers, and ambitious side projects.
            </p>
          </div>

          {/* Interactive Product Mockup Frame */}
          <div className="mt-14 sm:mt-16 max-w-5xl mx-auto">
            <div className="dub-mockup bg-card shadow-sm border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden w-full max-w-full">
              {/* Window Header */}
              <div className="py-2.5 sm:h-11 border-b border-border bg-secondary/60 px-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5] dark:bg-[#404040]" />
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5] dark:bg-[#404040]" />
                  <div className="w-3 h-3 rounded-full bg-[#e5e5e5] dark:bg-[#404040]" />
                  <span className="ml-2.5 text-xs font-mono text-muted-foreground hidden sm:inline">
                    devconnect.app/discover
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  {['active', 'hackathon', 'opensource'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-md transition-all font-medium capitalize shrink-0 ${
                        activeTab === tab
                          ? 'bg-primary text-primary-foreground shadow-subtle'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {tab === 'active' ? '⚡ Active Builders' : tab === 'hackathon' ? '🔥 Hackathon Squads' : '🌐 Open Source'}
                    </button>
                  ))}
                </div>
              </div>

              {/* App Shell Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] bg-card">
                {/* Left Mini Sidebar */}
                <div className="hidden md:flex md:col-span-3 border-r border-border bg-secondary/30 p-4 flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-xs flex items-center gap-2">
                      <Search className="w-3.5 h-3.5" />
                      Discover Developers
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground text-xs flex items-center gap-2 hover:bg-secondary">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Live Sockets (8)
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground text-xs flex items-center gap-2 hover:bg-secondary">
                      <Briefcase className="w-3.5 h-3.5" />
                      Engineering Jobs
                    </div>
                    <div className="px-3 py-2 rounded-lg text-muted-foreground text-xs flex items-center gap-2 hover:bg-secondary">
                      <Layers className="w-3.5 h-3.5" />
                      My Connections
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-card text-xs space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                      Satoshi 500 & Inter
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Hairline 1px borders hold every surface together with editorial clarity.
                    </p>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="col-span-1 md:col-span-9 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <h3 className="font-satoshi text-base font-semibold text-foreground">
                        {activeTab === 'active' ? 'Senior Engineers & Architects' : activeTab === 'hackathon' ? 'Immediate Hackathon Collaborators' : 'Verified Open Source Maintainers'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Showing verified profiles matching your stack preferences
                      </p>
                    </div>
                    <span className="dub-pill text-[11px] py-0.5 px-2 bg-secondary text-muted-foreground border-border">
                      Compact Density
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {currentDevs.map((dev, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border bg-card hover:border-ring transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-subtle"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center font-satoshi font-bold text-sm text-foreground shrink-0 group-hover:border-[#2563eb] group-hover:text-[#2563eb] transition-colors">
                            {dev.avatar}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-foreground">{dev.name}</span>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                                {dev.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{dev.role}</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {dev.stack.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 rounded-md bg-secondary text-foreground font-mono text-[11px] border border-border"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Link to={isAuthenticated ? "/search" : "/signup"} className="shrink-0">
                          <button className="dub-btn-outline text-xs py-1.5 px-3.5 w-full sm:w-auto group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                            Connect
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud — Grayscale Social Proof Grid */}
      <section className="py-14 border-b border-border bg-secondary/30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground mb-8">
            TRUSTED BY BUILDERS FROM LEADING ECOSYSTEMS & OPEN SOURCE PROJECTS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 sm:gap-8 items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
            {['Vercel', 'Linear', 'Raycast', 'Cal.com', 'Supabase', 'Beehiiv'].map((company) => (
              <div
                key={company}
                className="h-10 px-4 rounded-lg border border-border bg-card/60 flex items-center justify-center font-satoshi font-bold text-base text-foreground tracking-tight grayscale hover:grayscale-0 hover:border-ring transition-all cursor-default"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Capabilities / More Options Hub */}
      <section className="py-20 sm:py-24 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-16">
          <div className="max-w-2xl space-y-3">
            <div className="dub-pill">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="font-satoshi text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
              Everything you can build and explore on DevConnect
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Whether you are hunting for a technical co-founder, putting together a weekend hackathon squad, or reviewing architecture choices, every surface is built around developer productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: '#ea580c',
                title: 'Co-founder & Skill Matchmaking',
                description: 'Filter engineers by exact framework experience, timezone alignment, seniority level, and current availability to join new ventures.',
                tag: 'Network'
              },
              {
                icon: Sparkles,
                color: '#7c3aed',
                title: 'Hackathon & Squad Hub',
                description: 'Form instant project squads, share live technical blueprints, and recruit frontend or infrastructure specialists before kickoff.',
                tag: 'Collaboration'
              },
              {
                icon: Briefcase,
                color: '#2563eb',
                title: 'High-Signal Engineering Roles',
                description: 'Explore verified job openings and open-source bounties with salary transparency and direct messaging to the hiring team.',
                tag: 'Careers'
              },
              {
                icon: MessageSquare,
                color: '#16a34a',
                title: 'Low-Latency Real-time Sockets',
                description: 'Enjoy instant conversation feeds with syntax-highlighted code snippets, markdown support, and unread receipt tracking.',
                tag: 'Messaging'
              },
              {
                icon: GitPullRequest,
                color: '#ea580c',
                title: 'Verified GitHub & Stack Sync',
                description: 'Link your GitHub profile to showcase real pull requests, commit graphs, and live deployed endpoints without manual data entry.',
                tag: 'Portfolio'
              },
              {
                icon: Code2,
                color: '#7c3aed',
                title: 'Mentorship & Architecture Reviews',
                description: 'Pair with experienced systems architects or offer guided code reviews and career mentorship to aspiring engineers.',
                tag: 'Community'
              }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="dub-card p-6 flex flex-col justify-between hover:shadow-subtle transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border border-border bg-secondary"
                        style={{ color: item.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary text-muted-foreground">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-satoshi text-lg font-semibold text-foreground group-hover:text-[#2563eb] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-border flex items-center justify-between text-xs font-medium text-foreground">
                    <span>Explore option</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-[#2563eb] transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Z-Pattern Editorial Section */}
      <section className="py-20 sm:py-24 border-b border-border bg-secondary/20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="dub-pill">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              <span>Editorial SaaS Architecture</span>
            </div>
            <h2 className="font-satoshi text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Built for engineers who care about craft over vanity metrics.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Traditional social platforms drown developers in algorithmic engagement bait, ads, and generic status updates. DevConnect strips away the fluff. Every profile is a structured developer resume held together by hairline borders and true technical proof.
            </p>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2563eb] shrink-0" />
                <span>Compact density: 8px gaps and 12px card borders for maximum scannability</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2563eb] shrink-0" />
                <span>One electric blue (#2563eb) reserved purely for high-signal actions</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2563eb] shrink-0" />
                <span>Geist Mono typography for accurate stack and code representation</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="dub-card-elevated p-5 space-y-4 bg-card translate-y-0 sm:translate-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Profile Card 01</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-satoshi font-semibold text-foreground">SvelteKit & Rust Backend</h4>
                  <p className="text-xs text-muted-foreground">Looking for frontend co-maintainer for open-source database client.</p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border text-xs">
                  <span className="font-mono text-muted-foreground">14 mutual connections</span>
                  <span className="text-[#2563eb] font-medium">View stack →</span>
                </div>
              </div>

              <div className="dub-card-elevated p-5 space-y-4 bg-card sm:-translate-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Profile Card 02</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-satoshi font-semibold text-foreground">Distributed Systems & AI</h4>
                  <p className="text-xs text-muted-foreground">Shipping enterprise vector search engine. Open for advising.</p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border text-xs">
                  <span className="font-mono text-muted-foreground">28 verified PRs</span>
                  <span className="text-[#2563eb] font-medium">Connect →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Issues / Suggestions Form & Nodemailer Section */}
      <section id="feedback" className="py-20 sm:py-24 border-b border-border bg-background">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Explanation & Environment Variable Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="dub-pill">
                <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                <span>Direct Engineering Feedback</span>
              </div>
              <h2 className="font-satoshi text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
                Have feedback or found an issue?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We build DevConnect transparently with our developer community. Submit bug reports, feature suggestions, or direct questions to our engineering team. Our server handles both admin alerts and confirmation emails via Nodemailer.
              </p>
            </div>

            {/* Right Column: Contact & Suggestion Form */}
            <div className="lg:col-span-7">
              <div className="dub-card p-6 sm:p-8 bg-card border border-border space-y-7 shadow-subtle">
                <div className="border-b border-border pb-5">
                  <h3 className="font-satoshi text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                    Send a Message to Engineering
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Select a category and share your detailed feedback, bug report, or feature request.
                  </p>
                </div>

                {/* Category Selector Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                    1. Select Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Suggestion', icon: '💡', full: '💡 Suggestion' },
                      { label: 'Bug Report', icon: '🐛', full: '🐛 Bug Issue' },
                      { label: 'Feature Request', icon: '🚀', full: '🚀 Feature Request' },
                      { label: 'General Inquiry', icon: '💬', full: '💬 General Contact' },
                    ].map((item) => {
                      const isSelected = selectedCategory === item.full;
                      return (
                        <button
                          key={item.full}
                          type="button"
                          onClick={() => setSelectedCategory(item.full)}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#171717] text-white dark:bg-white dark:text-[#0a0a0a] border-transparent shadow-subtle font-semibold'
                              : 'bg-secondary/60 text-muted-foreground border-border hover:border-ring hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <span className="text-sm">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Banners */}
                {formStatus.success && (
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-bg-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Message sent successfully!</p>
                      <p className="text-xs opacity-90">
                        Thank you for your feedback. We have dispatched a confirmation email to your inbox and alerted the engineering team.
                      </p>
                    </div>
                  </div>
                )}

                {formStatus.error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-bg-in">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Could not send email right now</p>
                      <p className="text-xs opacity-90">{formStatus.error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                      2. Your Contact Information *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="contact-name" className="text-xs font-medium text-foreground block">
                          Your Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          placeholder="Alex Rivera"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="dub-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-email" className="text-xs font-medium text-foreground block">
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="alex@domain.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="dub-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                      3. {selectedCategory.split(' ')[1] || 'Submission'} Details *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Explain your suggestion, describe the issue steps, or share how we can collaborate..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="dub-input font-inter resize-y leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border mt-6">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
                      <span>Direct dispatch to engineering inbox via Nodemailer</span>
                    </div>
                    <button
                      type="submit"
                      disabled={formStatus.loading}
                      className="dub-btn-dark w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-sm disabled:opacity-50 shrink-0"
                    >
                      {formStatus.loading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Dispatching Mail...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit {selectedCategory.split(' ')[1] || 'Message'}</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Contrast CTA Section at the End */}
      <section className="py-20 sm:py-24 border-b border-border bg-secondary/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="dub-card-paper p-8 sm:p-14 border border-border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card shadow-subtle">
            <div className="space-y-3 max-w-2xl">
              <span className="dub-pill text-xs">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                <span>Join the Network</span>
              </span>
              <h2 className="font-satoshi text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
                Ready to ship with high-signal developers?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Create your verified developer profile today. Connect instantly by tech stack, explore active projects, and start collaborating in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
                <button className="dub-btn-dark w-full sm:w-auto px-6 py-3 text-base">
                  {isAuthenticated ? 'Enter Dashboard' : 'Create Free Profile'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="dub-btn-outline w-full sm:w-auto px-6 py-3 text-base">
                    Log In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-background text-sm text-muted-foreground">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[6px] bg-[#2563eb] flex items-center justify-center text-white">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-satoshi font-semibold text-base text-foreground tracking-tight">
                DevConnect
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <a href="#feedback" className="hover:text-foreground transition-colors">
                Report Issue / Suggestion
              </a>
              <a
                href="mailto:devtinder93@gmail.com"
                className="hover:text-foreground inline-flex items-center gap-1.5 text-[#2563eb]"
              >
                <Mail className="h-3.5 w-3.5" />
                devtinder93@gmail.com
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <div>
              © {new Date().getFullYear()} DevConnect. Held together by hairline borders and high-signal engineering data.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;