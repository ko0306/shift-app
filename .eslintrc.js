module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // 未使用変数は警告（エラーにはしない）
    'no-unused-vars': 'warn',
    // console.log は開発中のみ許容
    'no-console': 'warn',
    // react-hooks の依存配列は警告のみ
    'react-hooks/exhaustive-deps': 'warn',
    // セミコロン必須
    'semi': ['warn', 'always'],
    // シングルクォート統一
    'quotes': ['warn', 'single', { avoidEscape: true }],
  },
};
