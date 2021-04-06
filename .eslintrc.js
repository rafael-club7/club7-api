module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        semi: [2, 'always'],
        indent: [2, 4],
        'no-extend-native': ['error', { exceptions: ['String'] }],
        '@typescript-eslint/no-var-requires': 0
    }
};
