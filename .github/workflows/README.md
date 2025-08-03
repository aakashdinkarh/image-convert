# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated building and deployment.

## Workflows

### 1. `build-and-deploy.yml` - Build and Deploy

**Triggers:**

- Push to `main` or `master` branch
- Manual workflow dispatch (with custom target branch)

**What it does:**

1. Sets up Node.js 18
2. Installs dependencies
3. Builds the project for production
4. Deploys to the specified branch (default: `gh-pages`)

**Usage:**

- **Automatic**: Push to main/master branch to deploy to `gh-pages`
- **Manual**: Go to Actions tab → Build and Deploy → Run workflow → Enter target branch name

### 2. `build.yml` - Build Only

**Triggers:**

- Pull requests to `main` or `master` branch

**What it does:**

1. Sets up Node.js 18
2. Installs dependencies
3. Builds both development and production versions
4. Validates that the build process works

**Usage:**

- Automatically runs on pull requests to verify builds work
- No deployment, just validation

## Deployment Branches

### Default: `gh-pages`

- Perfect for GitHub Pages hosting
- Automatically served at: `https://username.github.io/repo-name/`

### Custom Branches

- You can specify any branch name via manual workflow dispatch
- Useful for staging, testing, or other hosting platforms

## Setup Instructions

### 1. Enable GitHub Pages (Optional)

If you want to use GitHub Pages:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select `gh-pages` branch
5. Save

### 2. Configure Repository Secrets (If Needed)

The workflows use `GITHUB_TOKEN` which is automatically provided by GitHub.

### 3. Push to Deploy

Simply push to your main branch and the workflow will automatically:

- Build your project
- Deploy to `gh-pages` branch
- Make it available for hosting

## Workflow Output

After a successful deployment, you'll see:

- ✅ Build completed successfully
- 📁 Files deployed to specified branch
- 🌐 GitHub Pages URL (if applicable)
- 📋 List of deployed files

## Troubleshooting

### Build Failures

- Check that all dependencies are in `package.json`
- Ensure Node.js version compatibility
- Verify all source files exist

### Deployment Failures

- Check repository permissions
- Ensure target branch doesn't have protection rules
- Verify GitHub token permissions

### GitHub Pages Not Working

- Ensure GitHub Pages is enabled in repository settings
- Check that the source branch is set correctly
- Wait a few minutes for changes to propagate
