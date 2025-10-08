# Git Commit Message Instructions

## Overview
Generate descriptive git commit messages following the Conventional Commits specification. All commits must be formatted as single-line commands using multiple `-m` flags.

## Conventional Commit Format

Use these prefixes based on the type of change:

- **feat:** A new feature or functionality
- **fix:** A bug fix
- **refactor:** Code restructuring without changing functionality
- **docs:** Documentation changes only
- **style:** Code style changes (formatting, whitespace, etc.)
- **test:** Adding or updating tests
- **chore:** Maintenance tasks, dependency updates, build changes
- **perf:** Performance improvements
- **ci:** CI/CD configuration changes
- **revert:** Reverting a previous commit

## Message Structure

Format the commit as a single-line command with multiple `-m` flags:

```bash
git commit -m "type(scope): brief description" -m "- First key change" -m "- Second key change" -m "- Additional details"
```

### Components:

1. **First `-m` flag**: Type, optional scope, and brief description
   - Format: `type(scope): description` or `type: description`
   - Keep under 72 characters
   - Use lowercase for the description
   - No period at the end

2. **Subsequent `-m` flags**: Key changes and additions
   - Each change on its own `-m` flag
   - Start with a dash and space: `"- Change description"`
   - Be specific and descriptive
   - Focus on what changed and why, not how

## Examples

### Feature Addition
```bash
git commit -m "feat(auth): add OAuth2 authentication" -m "- Implement Google and GitHub login providers" -m "- Add JWT token generation and validation" -m "- Create user session management"
```

### Bug Fix
```bash
git commit -m "fix(api): resolve null pointer exception in user endpoint" -m "- Add null checks for optional user fields" -m "- Update error handling for missing data"
```

### Refactoring
```bash
git commit -m "refactor(database): optimize query performance" -m "- Replace N+1 queries with batch loading" -m "- Add database indexes for frequently queried fields" -m "- Reduce average query time by 60%"
```

### Multiple File Changes
```bash
git commit -m "feat(ui): redesign dashboard layout" -m "- Update navigation component with responsive design" -m "- Add dark mode support" -m "- Implement data visualization widgets" -m "- Improve mobile accessibility"
```

### Documentation
```bash
git commit -m "docs(readme): update installation instructions" -m "- Add Docker setup guide" -m "- Include troubleshooting section" -m "- Update dependency versions"
```

### Chore
```bash
git commit -m "chore(deps): upgrade React to v18.2.0" -m "- Update all React-related dependencies" -m "- Fix breaking changes in component lifecycle" -m "- Update TypeScript types"
```

## Best Practices

1. **Be specific**: Describe what changed, not just which files
2. **Use imperative mood**: "add feature" not "added feature"
3. **Include context**: Explain why the change was made if not obvious
4. **Group related changes**: Combine logically related changes in one commit
5. **Separate concerns**: Keep unrelated changes in separate commits
6. **Limit scope**: Each `-m` flag should be a concise point (under 80 characters)
7. **Prioritize clarity**: Anyone reading the commit should understand the changes

## Scope Guidelines

Use scopes to indicate the area of the codebase affected:
- `(api)` - Backend API changes
- `(ui)` - User interface changes
- `(auth)` - Authentication/authorization
- `(database)` - Database schema or queries
- `(config)` - Configuration files
- `(tests)` - Test-related changes
- `(docs)` - Documentation

Scope is optional but recommended for larger projects.

## Output Format

Always output the complete `git commit` command ready to execute, with no additional formatting or explanation unless requested.