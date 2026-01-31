# Contributing to Critical Mineral Intelligence Platform

Thank you for your interest in contributing to the Critical Mineral Intelligence Platform! This document provides guidelines and standards for contributors to ensure consistency and quality across the project.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** before creating a new one
2. **Use descriptive titles** for issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, version)
   - Screenshots if applicable

### Suggesting Features

1. **Check the roadmap** for planned features
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case and benefits
   - Implementation suggestions (optional)
   - Potential challenges

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MineralInsight.git
   cd MineralInsight/critical-mineral
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Coding Standards

### Code Style

We use the following tools to maintain code quality:

- **ESLint** for linting JavaScript/TypeScript
- **Prettier** for code formatting
- **TypeScript** for type safety

### Naming Conventions

- **Components**: PascalCase (`MineralCard.tsx`)
- **Files**: camelCase for utilities (`apiService.ts`)
- **Variables**: camelCase (`mineralData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase with descriptive names (`IMineralData`)

### Component Structure

```typescript
// Component file structure
import React from 'react';
import { motion } from 'framer-motion';
import { ComponentProps } from './types';

interface ComponentNameProps {
  // Props definition
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 
}) => {
  // Component logic
  
  return (
    <motion.div>
      {/* JSX content */}
    </motion.div>
  );
};

export default ComponentName;
```

### TypeScript Guidelines

- **Always use types** for props and function parameters
- **Prefer interfaces** over types for object shapes
- **Use strict mode** in TypeScript configuration
- **Avoid `any` type** unless absolutely necessary

## 🧪 Testing Guidelines

### Test Structure

```typescript
// Example test file
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    // Test user interactions
  });
});
```

### Testing Requirements

- **Unit tests** for all components
- **Integration tests** for complex features
- **E2E tests** for critical user flows
- **Minimum 80% code coverage**

## 📁 File Organization

```
src/
├── components/
│   ├── ui/              # Base UI components
│   ├── dashboard/       # Dashboard components
│   ├── home/           # Homepage components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API services
└── utils/              # Helper functions
```

## 🔄 Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(dashboard): add mineral risk assessment component`
- `fix(api): resolve data fetching error handling`
- `docs(readme): update installation instructions`

### Pull Request Process

1. **Create a pull request** from your feature branch
2. **Fill the PR template** completely
3. **Request reviews** from team members
4. **Address feedback** promptly
5. **Ensure CI passes** before merge

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] All tests pass
```

## 🎯 Development Priorities

### High Priority
1. **Security fixes**
2. **Critical bugs**
3. **Performance improvements**
4. **Accessibility enhancements**

### Medium Priority
1. **New features**
2. **UI/UX improvements**
3. **Documentation updates**
4. **Code refactoring**

### Low Priority
1. **Minor optimizations**
2. **Code style improvements**
3. **Experimental features**

## 🔍 Code Review Guidelines

### Review Checklist

- **Functionality**: Does the code work as expected?
- **Performance**: Are there performance implications?
- **Security**: Are there security vulnerabilities?
- **Accessibility**: Is the code accessible?
- **Testing**: Are tests adequate?
- **Documentation**: Is documentation updated?

### Review Process

1. **Be constructive** and respectful
2. **Explain issues** clearly with examples
3. **Suggest improvements** when possible
4. **Acknowledge good practices** in the code

## 🚀 Release Process

### Version Bumping

- **Patch**: `x.x.1` - Bug fixes
- **Minor**: `x.1.x` - New features (backward compatible)
- **Major**: `1.x.x` - Breaking changes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated
- [ ] Tag created
- [ ] Release notes published

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Tools
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Testing Library](https://testing-library.com/docs/)

## 🤝 Community Guidelines

### Code of Conduct

1. **Be respectful** and inclusive
2. **Welcome newcomers** and help them learn
3. **Focus on what is best** for the community
4. **Show empathy** towards other community members

### Communication

- **Use clear and concise** language
- **Provide context** for your messages
- **Ask questions** when unsure
- **Share knowledge** and help others

## 🎉 Recognition

Contributors are recognized in:

- **README.md** - Core contributors section
- **CHANGELOG.md** - Feature attributions
- **Annual reports** - Contributor statistics
- **Community events** - Contributor spotlights

## 📞 Getting Help

If you need help:

1. **Check documentation** first
2. **Search existing issues**
3. **Ask in discussions**
4. **Contact maintainers**

---

Thank you for contributing to the Critical Mineral Intelligence Platform! Your contributions help make this project better for everyone.
