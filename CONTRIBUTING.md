# Contributing to X-ray Setup Scripts

Thank you for your interest in contributing to this project! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

This project follows a simple code of conduct:

- **Be respectful** to all contributors
- **Be constructive** in feedback and discussions
- **Be patient** with new contributors
- **Focus on the issue**, not the person

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before submitting a bug report:
1. Check [existing issues](https://github.com/DanOps-1/X-ray/issues) to avoid duplicates
2. Test with the latest version
3. Collect relevant information (OS, Xray version, error messages)

When reporting, include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**:
  - OS and version
  - Xray version
  - Script version
- **Logs**: Relevant log output (sanitize sensitive info!)

### 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Check if it's already suggested
2. Explain the use case clearly
3. Describe the proposed solution
4. Discuss alternatives if applicable

### 📚 Improving Documentation

Documentation improvements are highly valued:
- Fix typos and grammar
- Clarify confusing sections
- Add missing information
- Translate to other languages
- Add examples and tutorials

### 🔧 Contributing Code

#### Types of Contributions Needed

- **Bug fixes**
- **New features** (discuss in an issue first)
- **Script improvements**
- **Performance optimizations**
- **Test coverage**
- **Platform support** (new Linux distributions)

---

## Development Setup

### Prerequisites

- Linux environment (Ubuntu, Debian, or similar)
- Root access (for testing)
- Git installed
- Basic Bash scripting knowledge
- Python 3 (for Python scripts)

### Setting Up Development Environment

1. **Fork the repository**
```bash
# On GitHub, click "Fork" button
```

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/X-ray.git
cd X-ray
```

3. **Create a branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

4. **Make your changes**
```bash
# Edit files
nano scripts/install.sh
```

5. **Test your changes**
```bash
# Test installation script
sudo bash scripts/install.sh

# Test user management
sudo bash scripts/add-user.sh test@example.com
sudo bash scripts/del-user.sh test@example.com

# Test configuration display
sudo bash scripts/show-config.sh all
```

---

## Submitting Changes

### Before Submitting

- ✅ Test your changes thoroughly
- ✅ Update documentation if needed
- ✅ Follow code style guidelines
- ✅ Write clear commit messages
- ✅ Ensure scripts have proper permissions (`chmod +x`)

### Pull Request Process

1. **Update your fork**
```bash
git fetch upstream
git merge upstream/main
```

2. **Commit your changes**
```bash
git add .
git commit -m "Add feature: description"
```

3. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request**
- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template:
  - **Title**: Brief description
  - **Description**: Detailed explanation
  - **Changes**: List of changes made
  - **Testing**: How you tested
  - **Screenshots**: If applicable

5. **Address review comments**
- Respond to feedback
- Make requested changes
- Push updates to the same branch

---

## Style Guidelines

### Bash Scripts

#### General Rules

- Use `#!/bin/bash` shebang
- Set `set -e` for error handling
- Use clear variable names (UPPER_CASE for constants)
- Add comments for complex logic
- Include usage help

#### Example

```bash
#!/bin/bash

# Script description
# Usage: bash script.sh [options]

set -e

# Constants
readonly CONFIG_FILE="/usr/local/etc/xray/config.json"
readonly BACKUP_DIR="/var/backups/xray"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: This script requires root privileges${NC}"
  exit 1
fi

# Main logic here
```

#### Formatting

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Max 80 characters when reasonable
- **Quotes**: Use double quotes for variables, single for strings
- **Braces**: Always use `${VAR}` not `$VAR`

### Python Scripts

Follow PEP 8:
- **Indentation**: 4 spaces
- **Line length**: Max 79 characters
- **Imports**: Group stdlib, third-party, local
- **Docstrings**: Use for functions and modules

### Documentation

- **Markdown**: Follow CommonMark spec
- **Headers**: Use ATX-style (`#` headers)
- **Lists**: Consistent bullet style
- **Code blocks**: Always specify language
- **Links**: Use reference-style for long URLs

---

## Commit Message Guidelines

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

**Good:**
```
feat: Add multi-user support to installation script

- Allow specifying multiple users during installation
- Generate separate share links for each user
- Update documentation with multi-user examples

Closes #123
```

**Good:**
```
fix: Resolve port conflict in show-config script

The script was failing when port 443 was not listening.
Added error handling to check if xray service is running
before attempting to display port information.

Fixes #456
```

**Bad:**
```
update stuff
```

**Bad:**
```
Fixed bug
```

### Subject Line Rules

- Use imperative mood ("Add feature" not "Added feature")
- No period at the end
- Max 50 characters
- Capitalize first letter

### Body Rules

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Separate from subject with blank line

---

## Testing Guidelines

### Manual Testing Checklist

Before submitting, test:

- ✅ Fresh installation on clean system
- ✅ Adding multiple users
- ✅ Deleting users
- ✅ Configuration display
- ✅ Service restart after changes
- ✅ Backup and restore
- ✅ Update functionality
- ✅ Uninstallation

### Test Environments

Test on multiple distributions when possible:
- Ubuntu 22.04 LTS
- Debian 12
- CentOS Stream 9
- Kali Linux (latest)

---

## Questions?

- Open a [Discussion](https://github.com/DanOps-1/X-ray/discussions)
- Ask in an [Issue](https://github.com/DanOps-1/X-ray/issues)
- Check existing [Documentation](docs/)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
