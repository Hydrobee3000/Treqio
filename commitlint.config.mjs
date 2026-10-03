const AI_ATTRIBUTION_PATTERNS = [
  /^co-authored-by:.*(claude|anthropic|copilot|openai|chatgpt|gpt|gemini|codex|cursor|devin)/im,
  /^\W*generated (with|by)\b/im,
]

/** @type {import('@commitlint/types').UserConfig} */
export default {
  // Наследуем все правила Conventional Commits
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'no-ai-attribution': (parsed) => [
          !AI_ATTRIBUTION_PATTERNS.some((pattern) => pattern.test(parsed.raw ?? '')),
          'commit message must not contain AI attribution (Co-Authored-By trailer or "Generated with" line)',
        ],
      },
    },
  ],
  rules: {
    'no-ai-attribution': [2, 'always'],
    // Разрешённые типы коммитов
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'chore',
        'docs',
        'style',
        'test',
        'ci',
        'build',
        'perf',
        'revert',
      ],
    ],
    // Скоуп в kebab-case: feat(my-scope) — OK, feat(myScope) — ошибка
    'scope-case': [2, 'always', 'kebab-case'],
    // Описание строчными буквами
    'subject-case': [2, 'always', 'lower-case'],
  },
}
