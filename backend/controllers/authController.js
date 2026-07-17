const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Initiate GitHub OAuth login
// @route   GET /api/auth/github
// @access  Public
const githubLogin = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ 
      success: false, 
      message: 'GitHub OAuth is not configured on the server (missing GITHUB_CLIENT_ID).' 
    });
  }
  const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/github/callback`);
  const scope = encodeURIComponent('read:user user:email');
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_oauth_failed`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData.error_description || tokenData.error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub User profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const githubProfile = await userResponse.json();

    // Fetch GitHub Emails
    let email = githubProfile.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const emails = await emailsResponse.json();
      const primaryEmailObj = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) || emails[0] : null;
      if (primaryEmailObj) {
        email = primaryEmailObj.email;
      }
    }

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_no_email`);
    }

    // Fetch top repositories
    let githubRepos = [];
    let reposCount = githubProfile.public_repos || 0;
    let followersCount = githubProfile.followers || 0;
    let followingCount = githubProfile.following || 0;

    try {
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=6', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const reposData = await reposResponse.json();
      if (Array.isArray(reposData)) {
        githubRepos = reposData.map(r => ({
          name: r.name,
          description: r.description || '',
          url: r.html_url,
          stars: r.stargazers_count || 0,
          language: r.language || 'Code'
        }));
      }
    } catch (e) {
      console.warn('Could not fetch GitHub repos during OAuth:', e.message);
    }

    // Extract skills from repo languages
    const extractedSkills = Array.from(new Set(
      githubRepos.map(r => r.language).filter(Boolean)
    ));

    // Check if user already exists
    let user = await User.findOne({ $or: [{ githubId: String(githubProfile.id) }, { email: email.toLowerCase() }] });

    if (!user) {
      // Create new user via GitHub
      user = await User.create({
        name: githubProfile.name || githubProfile.login || 'Developer',
        email: email.toLowerCase(),
        bio: githubProfile.bio || `Developer on DevConnect. Checkout my GitHub (@${githubProfile.login}).`,
        profilePicture: githubProfile.avatar_url,
        githubUrl: githubProfile.html_url,
        githubId: String(githubProfile.id),
        githubUsername: githubProfile.login,
        githubStats: {
          repos: reposCount,
          followers: followersCount,
          following: followingCount
        },
        githubRepos,
        skills: extractedSkills.length > 0 ? extractedSkills : ['JavaScript', 'Git'],
        location: githubProfile.location || ''
      });
    } else {
      // Update existing user with latest GitHub data
      user.githubId = String(githubProfile.id);
      user.githubUsername = githubProfile.login;
      user.githubUrl = githubProfile.html_url;
      user.githubStats = {
        repos: reposCount,
        followers: followersCount,
        following: followingCount
      };
      if (githubRepos.length > 0) {
        user.githubRepos = githubRepos;
      }
      if (!user.location && githubProfile.location) {
        user.location = githubProfile.location;
      }
      await user.save();
    }

    // Set JWT cookie and redirect to dashboard
    const token = generateToken(user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true
    };
    res.cookie('jwt', token, cookieOptions);

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?oauth=success`);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=github_oauth_exception`);
  }
};

// @desc    Sync GitHub profile and repositories for logged in user
// @route   POST /api/auth/sync-github
// @access  Private
const syncGitHub = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUsername = username || user.githubUsername || (user.githubUrl ? user.githubUrl.split('/').pop() : null);
    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Please provide a GitHub username or link your GitHub profile first.' });
    }

    // Fetch public stats from GitHub API
    const profileRes = await fetch(`https://api.github.com/users/${targetUsername}`);
    if (!profileRes.ok) {
      return res.status(404).json({ success: false, message: `GitHub account "@${targetUsername}" not found.` });
    }
    const profileData = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${targetUsername}/repos?sort=updated&per_page=6`);
    let githubRepos = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      if (Array.isArray(reposData)) {
        githubRepos = reposData.map(r => ({
          name: r.name,
          description: r.description || '',
          url: r.html_url,
          stars: r.stargazers_count || 0,
          language: r.language || 'Code'
        }));
      }
    }

    user.githubUsername = profileData.login;
    user.githubUrl = profileData.html_url;
    user.githubStats = {
      repos: profileData.public_repos || 0,
      followers: profileData.followers || 0,
      following: profileData.following || 0
    };
    if (githubRepos.length > 0) {
      user.githubRepos = githubRepos;
    }
    if (!user.profilePicture || user.profilePicture.includes('as1.ftcdn.net')) {
      user.profilePicture = profileData.avatar_url;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'GitHub profile and repositories synced successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
        githubUrl: user.githubUrl,
        githubUsername: user.githubUsername,
        githubStats: user.githubStats,
        githubRepos: user.githubRepos,
        location: user.location,
        openToCollab: user.openToCollab,
        pinnedProjects: user.pinnedProjects
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  githubLogin,
  githubCallback,
  syncGitHub
};
