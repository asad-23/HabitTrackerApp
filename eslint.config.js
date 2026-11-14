const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'drizzle/*', 'node_modules/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message: 'Use a color token from src/design/tokens.ts.',
        },
        {
          selector: "Property[key.name='fontSize'] > Literal",
          message: 'Use the type scale from src/design/tokens.ts.',
        },
      ],
    },
  },
  {
    files: ['src/design/tokens.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // RemoteViews cannot consume the app's text styles, so widget text sizes
    // are literal. Colors still come from the token palette.
    files: ['src/widget/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message: 'Use a color token from src/design/tokens.ts.',
        },
      ],
    },
  },
];
