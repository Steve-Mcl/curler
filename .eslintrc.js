module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'node': true,
        'mocha': true,
    },
    // add globals RED and $ to eslint
    'globals': {
        'RED': true,
        '$': true,
    },
    'extends': 'eslint:recommended',
    'overrides': [
        {
            'env': {
                'node': true
            },
            'files': [
                '.eslintrc.{js,cjs}'
            ],
            'parserOptions': {
                'sourceType': 'script'
            }
        }
    ],
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        // we dont want semi colons
        'semi': ['error', 'never'],
        // we dont want to use var
        'no-var': 'error',
        // we dont want to use console.log
        'no-console': 'warn',
        // we want 4 spaces, no tabs
        'indent': ['error', 4],
        // we want single quotes but allow double quotes to avoid escaping
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
        // we want to use === and !==
        'eqeqeq': 'error',
        // allow unused vars if they start with _
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
    }
}
