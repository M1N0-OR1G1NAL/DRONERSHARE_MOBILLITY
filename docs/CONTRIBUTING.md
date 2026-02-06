# Contributing to DroneShare Mobility

Thank you for your interest in contributing to DroneShare Mobility! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Features

For feature requests, please create an issue describing:
- The problem the feature would solve
- Proposed solution
- Alternative solutions considered
- Any additional context

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure tests pass** with `npm test`
6. **Commit your changes** with clear, descriptive messages
7. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY

# Install backend dependencies
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
docker-compose up mongodb

# Seed database with sample data
npm run seed

# Run backend in development mode
npm run dev
```

## Coding Standards

### JavaScript Style

- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Use `const` and `let`, avoid `var`
- Use async/await over callbacks
- Meaningful variable and function names

### Backend Structure

```
backend/
├── src/
│   ├── models/       # Mongoose models
│   ├── controllers/  # Request handlers
│   ├── routes/       # Express routes
│   ├── services/     # Business logic
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Helper functions
│   └── config/       # Configuration files
├── tests/            # Test files
└── scripts/          # Utility scripts
```

### Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(reservations): add photo verification for level 3
fix(energy): correct battery calculation for solar panels
docs(api): update reservation endpoint examples
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/api.test.js

# Watch mode
npm test -- --watch
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```javascript
describe('Energy Management', () => {
  test('should calculate battery requirement correctly', async () => {
    // Arrange
    const drone = { batteryLevel: 80 };
    const requiredEnergy = 30;
    
    // Act
    const status = await energyManagement.checkBatteryStatus(drone, requiredEnergy);
    
    // Assert
    expect(status.hasSufficient).toBe(true);
    expect(status.currentLevel).toBe(80);
  });
});
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions
- Include parameter types and descriptions
- Provide usage examples for complex functions

Example:
```javascript
/**
 * Calculate optimal route from point A to point B
 * @param {Object} startLocation - {lat, lng}
 * @param {Object} endLocation - {lat, lng}
 * @param {Object} options - Additional options (droneType, payload, etc.)
 * @returns {Object} Optimized route with waypoints and estimated time
 */
async calculateOptimalRoute(startLocation, endLocation, options = {}) {
  // Implementation
}
```

### API Documentation

When adding or modifying API endpoints, update:
- `docs/API.md` with endpoint details
- Request/response examples
- Error codes and messages

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:
1. Email the maintainers directly
2. Provide detailed description
3. Include steps to reproduce if applicable

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate and sanitize all user input
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

## Database Migrations

When modifying database schemas:
1. Update model files
2. Create migration script if needed
3. Update seed data
4. Document changes in PR

## Performance Considerations

- Optimize database queries (use indexes)
- Implement caching where appropriate
- Consider pagination for large datasets
- Profile code for bottlenecks

## Deployment

Changes merged to `main` are automatically deployed to:
- Development: After merge
- Staging: After successful dev deployment
- Production: Manual approval required

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing to DroneShare Mobility! 🚁
