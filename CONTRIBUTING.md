# Contributing to AssetTrackr

Thank you for considering contributing to AssetTrackr! This document outlines the standards and workflow for development.

## Development Workflow

Our project uses several tools to ensure code quality and consistency:

1. **Husky**: Automates git hooks to run tests, linters, and type checking before commits
2. **lint-staged**: Runs linters only on staged files for faster checks
3. **ESLint**: Enforces code quality and catches potential problems
4. **Prettier**: Ensures consistent code formatting
5. **TypeScript**: Provides static type checking
6. **commitlint**: Enforces conventional commit message format

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **perf**: Code changes that improve performance
- **test**: Adding or modifying tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverting a previous commit

Example:
```
feat(auth): implement JWT authentication

Add JWT token generation and validation for user authentication.

Closes #123
```

## Pre-commit Checks

Before you commit, the following checks will run automatically:

1. Code formatting with Prettier
2. Linting with ESLint
3. Type checking with TypeScript

Make sure these checks pass before committing your changes.

## Development Commands

```bash
# Install dependencies
npm install

# Start development servers (client + server)
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck

# Build for production
npm run build
```

## Pull Request Process

1. Ensure your code passes all checks (linting, type checking, etc.)
2. Update the README.md or documentation if needed
3. Update the version number if applicable
4. Submit your PR with a clear title and description 