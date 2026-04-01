# 設計書: Mirai Shoten Admin (mirai-shoten-admin)

本設計書の対象は `未来商店商材` に対応する管理画面です。
`godufo-game`、`quiz-game`、`脱出ゲーム` とは連携せず、未来商店商材の注文データ運用にのみ責務を持ちます。

## 1. 目的
- **開発目的**: EC 注文管理を題材に、CRUD機能・フォーム検証・XSS対策、クラス責務分離設計力を示す。
- **評価してほしい点**: AdminManager の責務集約、OrderValidator/XSSProtectionAdmin の機能分離、UIコンポーネント再利用、LocalStorage との連携。

## 2. 画面構成・遷移
### 画面一覧
- **ダッシュボード** (`index.html`)
  - 注文一覧表示
  - 注文追加フォーム
  - 注文編集フォーム
  - 顧客情報テーブル
  - 編集・削除操作パネル

### 遷移フロー
```
起動 → src/main.js 初期化
      ↓
    ダッシュボード描画 → テーブルイベント再登録
      ↓
    注文追加 / 注文編集 → LocalStorage 保存 → 画面再描画
      ↓
    削除確認 → LocalStorage 更新 → 画面再描画
```

## 3. クラス設計（責務表）
| クラス | 責務 | 主なメソッド | 依存 |
|---|---|---|---|
| AdminManager | 注文データ CRUD 統括 | `addOrder`, `editOrder`, `deleteOrder`, `getAllOrders`, `getOrderById`, `updateOrderStatus` | OrderValidator, XSSProtectionAdmin |
| AdminUIComponents | UI 要素の描画・更新 | `renderOrderTable`, `renderCustomerInfo`, `showNotice`, `hideNotice`, `clearOrderForm` | XSSProtectionAdmin |
| OrderValidator | 注文データの妥当性検証 | `isValidOrderData`, `isValidEmail`, `isValidStatus`, `isValidQuantity`, `isValidTotalPrice` | XSSProtectionAdmin |
| XSSProtectionAdmin | XSS 対策・エスケープ | `escape`, `sanitizeInput`, `normalizeFullWidthAscii` | 文字列処理 |
| AdminStyleManager | 視覚効果・テーマ管理 | `initTheme`, `setAnimationMode`, `toggleDarkMode`, `applyResponsiveCSS` | DOM |
| AdminConstants | 定数・設定管理 | - | - |

## 4. データ設計
### LocalStorage キー
- **`adminOrders`**: 注文データ一覧（JSON 文字列）
  ```json
  [
    {
      "id": "ORD-2024-001",
      "customerName": "山田太郎",
      "email": "yamada@example.com",
      "productCode": "PROD-001",
      "quantity": 2,
      "totalPrice": 6000,
      "status": "pending",
      "createdAt": "2024-04-01T12:00:00Z",
      "updatedAt": "2024-04-01T12:00:00Z"
    }
  ]
  ```

### 注文ステータス
- `pending`: 注文受付中
- `processing`: 処理中
- `shipped`: 発送済み
- `delivered`: 配達完了
- `cancelled`: キャンセル

### バリデーション規則
| 項目 | 規則 | エラーメッセージ |
|---|---|---|
| 顧客名 | 1～50文字, 英数・日本語・スペースのみ | "顧客名は必須で1～50文字です" |
| メール | RFC 5322 準拠の形式 | "有効なメールアドレスを入力してください" |
| 数量 | 1～999 の整数 | "数量は1～999の整数です" |
| ステータス | pending/processing/shipped/delivered/cancelled | "有効なステータスを選択してください" |

## 5. 非機能要件

### 命名規則
- **ファイル**: kebab-case（例: `admin-manager.js`）
- **クラス**: PascalCase（例: `AdminManager`）
- **メソッド・変数**: camelCase（例: `addOrder`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_QUANTITY`）

### 品質ゲート
- **Lint**: `npm run lint` — 全ファイル ESLint:recommended で検証
- **Test**: `npm test` — Node.js `node:test` で単体テスト実行
- **GitHub Actions CI**: 各プッシュで自動検証
- **ブラウザ互換性**: Chrome / Edge 最新版推奨

### 既知制約
- ビルドツールなし（バニラ JS、学習優先）
- バックエンド API なし（LocalStorage のみ）
- 認証機能なし（ローカル開発用）

## 6. 実行フロー・処理

### 初期化フロー
```
main.js
  ↓
AdminManager.getInstance()
  ↓
AdminStyleManager.initTheme()
  ↓
updateDashboard()
  ├── AdminManager.getAllOrders()
  ├── AdminManager.getStatistics()
  ├── AdminUIComponents.renderOrderTable()
  └── AdminUIComponents.renderCustomerInfo()
  ↓
テーブルの編集・削除イベント登録
```

### 注文追加フロー
```
Form Submit Event
  ↓
formData = { name, email, productCode, quantity, totalPrice }
  ↓
OrderValidator.isValidOrderData( formData )
  ├─ YES: 続行
  └─ NO: showNotice("エラー") → 終了
  ↓
AdminManager.addOrder( formData )
  ├── orders.push( order )
  ├── localStorage["adminOrders"] = JSON.stringify( orders )
  └── AdminUIComponents.renderOrderTable()
  ↓
showNotice("注文を追加しました")
  ↓
clearOrderForm()
```

### 注文削除フロー
```
Delete Button Click
  ↓
confirm("本当に削除しますか？")
  ├─ OK: 続行
  └─ Cancel: 終了
  ↓
AdminManager.deleteOrder( orderId )
  ├── orders = orders.filter( o => o.id !== orderId )
  ├── localStorage["adminOrders"] = JSON.stringify( orders )
  └── AdminUIComponents.renderOrderTable()
  ↓
showNotice("注文を削除しました")
```

## 7. 環境セットアップ

### 必須環境
- **Node.js**: 20 以上
- **npm**: 9 以上（Node.js 同梱）
- **ブラウザ**: Chrome / Edge 最新版

### package.json スクリプト
```json
{
  "scripts": {
    "lint": "eslint src/ --ext .js",
    "test": "node --test src/**/*.test.js",
    "test:watch": "node --test --watch src/**/*.test.js"
  }
}
```

### 開発ワークフロー
1. コード編集 → `npm run lint` → 修正
2. テスト実行 → `npm test` → 合格確認
3. ブラウザで動作確認 → Live Server で `index.html` 開く
4. コミット → `git push origin main`

## 8. 今後の改善

### 短期（Phase 2）
- UI 回帰テストの追加（Playwright 等）
- 注文ステータス変更時のメール通知ログ
- 売上集計ダッシュボード

### 中期（Phase 3）
- バックエンド API 連携（Node.js Express 等）
- 管理者認証・認可機能
- CSV エクスポート機能

### 長期（Phase 4）
- 多言語対応（日本語 / 英語 / 中国語）
- リアルタイム在庫更新
- 分析ダッシュボード（GraphQL）

## 9. チェックリスト（提出前検証）

### コード品質
- [x] `npm run lint` が成功
- [x] `npm test` が成功（全テスト合格）
- [x] 全クラスに JSDoc ヘッダがある
- [x] 全メソッドに「目的/入力/処理/出力/補足」が記載されている

### 機能動作
- [ ] ダッシュボード起動時に注文一覧が表示される
- [ ] 「注文追加」フォームで新規注文を追加できる
- [ ] 编集ボタンで既存注文を更新できる（例: ステータス変更）
- [ ] 削除ボタンで注文を削除できる（確認ダイアログ付き）
- [ ] ページリロード後も注文データが保持される（LocalStorage）

### XSS 対策
- [ ] XSSProtectionAdmin.escape() で特殊文字をエスケープ
- [ ] フォーム入力値を全て sanitizeInput() に通す
- [ ] innerHTML ではなく textContent / XSS安全な方法で描画

### ドキュメント
- [ ] README.md が完成（セットアップから実行まで再現可能）
- [ ] DESIGN.md が完成（このファイル）
- [ ] GitHub および npm の package.json に概要がある

### GitHub
- [x] CI workflow（.github/workflows/ci.yml） を同梱
- [ ] リモート repo 作成（mirai-shoten-admin）
- [ ] 初回 commit "Initial portfolio submission"
- [ ] main ブランチで保護設定（PR 必須）

## 10. 実装メモ

### 参照プロジェクト
本設計は下記 4 プロジェクトの標準を踏襲：
- **godufo-game**: Manager 系クラスの責務分離
- **quiz-game**: UI コンポーネント化と画面遷移
- **脱出ゲーム**: Validator+ XSS 分離パターン
- **未来商店商材**: CartService + LocalStorage 連携モデル

### アーキテクチャ方針
- **責務分離**: CRUD は AdminManager、UI は AdminUIComponents、検証は OrderValidator
- **XSS 対策**: すべての外部入力を XSSProtectionAdmin.sanitizeInput() 経由
- **再利用性**: AdminUIComponents は汎用的に設計（他プロジェクトで流用可能）
- **テスト容易性**: モジュール単位で独立テスト可能
