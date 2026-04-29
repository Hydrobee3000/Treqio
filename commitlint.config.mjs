/** @type {import('@commitlint/types').UserConfig} */
export default {
  // Наследуем все правила Conventional Commits
  extends: ['@commitlint/config-conventional'],
  rules: {
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
