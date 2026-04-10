# mirai-shoten-admin ドキュメント

## セットアップ手順

1. Supabaseプロジェクト作成・テーブル定義
2. `.env` ファイルにAPIキー等を設定
3. `npm install` で依存パッケージ導入
4. バックエンド: `npm run dev`
5. フロントエンド: `npm run dev`

## システム構成

- フロントエンド（React, Vite）
  - APIリクエスト → バックエンド
- バックエンド（Node.js, Express）
  - Supabase JSクライアントでDB操作
- データベース（Supabase PostgreSQL）

## 参考ドキュメント
- [ERD.md](./ERD.md)
- [API_SPEC.md](./API_SPEC.md)
