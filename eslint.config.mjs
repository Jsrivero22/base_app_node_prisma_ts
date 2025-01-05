import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
    { ignores: ['dist/'] },
    // { files: ['**/*.{js,mjs,cjs,ts}'] },
    { files: ['src/**/*.{js,ts}, test/**/*.{js,ts}'] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];
