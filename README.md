



# Mirai Shoten Admin

未来商店商材 注文管理ダッシュボード（React+Express+Supabase）

---

## 1. プロジェクト概要・特徴
- フルスタック（React/Vite/TypeScript + Express/Node.js + Supabase/PostgreSQL）
- CI/CD・自動テスト・セキュリティ・現場運用ノウハウを重視
- 本番・ローカル・テスト環境の切り分けと説明を徹底

---

## 2. クイックスタート
### ローカル開発
```powershell
git clone ...
cd mirai-shoten-admin
npm install
cd backend && npm install
cd ../frontend && npm install
```
### サーバー起動
```powershell
cd backend && npm run dev
cd frontend && npm run dev
```
### テスト・Lint
```powershell
cd backend
npm run lint   # ESLint/Prettier
set NODE_ENV=test; npm test   # Jest+Supertest
```

---

## 3. 本番・デモ環境とテスト用アカウント
- フロント: https://mirai-shoten-admin.vercel.app
- バックエンド: https://mirai-shoten-admin-backend.vercel.app
- 管理者ID: `admin@mirai-shoten.com` / パスワード: `Admin1234!`

---

## 4. 設計・仕様ドキュメント
- SCREEN-OVERVIEW.md: 画面構成・導線
- DESIGN.md: 実装設計・主要分岐
- docs/API_SPEC.md: API仕様
- docs/ERD.md: ER図

---

## 5. 技術・運用の工夫点
- 型安全（TypeScript）・ESLint/Prettier・CI自動化
- API/DB/認証/バリデーション/XSS対策を徹底
- Supabase RLS・JWT認証・CORS制御
- テスト自動化（Jest+Supertest）・CI（GitHub Actions）
- なぜこの設計・運用にしたか、現場での工夫・苦労も明記

---

## 6. テスト・CI/CD・品質保証
- `npm run lint`：ESLint/Prettierによる静的解析
- `npm test`：Jest+SupertestによるAPI自動テスト（CRUD・認証・異常系・バリデーション網羅）
- CI（GitHub Actions）：Lint・テスト・ビルド自動化
- テスト時のみCORS緩和、本番・開発は厳格制御

---

## 7. 運用FAQ・トラブルシューティング
### よくある質問
- Q. テスト用アカウントは？
  A. 上記「3. 本番・デモ環境」参照。
- Q. ローカルでAPIが動かない
  A. .env設定・Supabaseキー・PORT競合を確認。
### トラブル対応
- サーバー起動エラー：依存パッケージ・環境変数・DB接続を再確認
- テスト失敗：CORS/認証/DB初期データ・テスト用アカウントを確認

---

## 8. 今後の改善・展望
- E2Eテスト自動化（Cypress等）
- APIレスポンス多言語化・アクセシビリティ強化
- パフォーマンス監視・エラートラッキング導入
- 利用者フィードバックを反映したUI/UX改善

---

## 9. ライセンス・謝辞・参考文献
MITライセンス。著作権は未来商店商材プロジェクトチームに帰属。
本システムの開発にあたり、以下のOSS・資料・関係者に感謝します：
- React, Express, Supabase, Vite, TypeScript, Jest, Supertest
- 各種公式ドキュメント・技術記事
- テスト協力者・フィードバック提供者

---

## 付録：旧バニラJS版（index.html）について
本リポジトリ直下の `index.html` は「ローカル専用の旧バニラJS版サンプル」です。
現行のフルスタック版（React+Express+Supabase）とは完全に別物であり、
**本番・審査・現場利用は必ず backend/・frontend/ ディレクトリ配下の現行版をご利用ください。**
旧版は「技術比較・参考実装」として残していますが、セットアップ・運用・テスト・CI/CD・セキュリティ等は現行版のみを対象としています。
### 使い方（旧バニラJS版）
1. このリポジトリをクローンまたはダウンロード
2. `mirai-shoten-admin/index.html` をブラウザで直接開く
   - ローカルストレージにデータが保存されます
3. または以下コマンドでローカルサーバー起動
   ```powershell
   cd C:\テスト\mirai-shoten-admin
   python -m http.server 5505
   ```
   ブラウザで `http://localhost:5505/index.html` を開く
### 注意
- 本番・審査・現場利用には**絶対に使用しないでください**
- セキュリティ・運用・保守・拡張性は一切担保されません
  A. 上記「3. 本番・デモ環境」参照。
- Q. ローカルでAPIが動かない
  A. .env設定・Supabaseキー・PORT競合を確認。

### トラブル対応
- サーバー起動エラー：依存パッケージ・環境変数・DB接続を再確認
- テスト失敗：CORS/認証/DB初期データ・テスト用アカウントを確認

---


