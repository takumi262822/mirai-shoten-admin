# 設計書: Mirai Shoten Admin (mirai-shoten-admin)

## 1. 文書概要

### 1.1 目的
本書は Mirai Shoten Admin の実装設計書である。画面構成や操作導線の説明は SCREEN-OVERVIEW.md に分離し、本書では JavaScript 実装を対象に、クラス単位・関数単位・主要分岐単位で処理内容を定義する。

### 1.2 対象範囲
- ダッシュボード初期化処理
- 注文の追加、編集、削除、取得、集計処理
- 注文一覧と顧客一覧の描画処理
- 注文入力値の検証処理
- XSS 対策、テーマ切替、LocalStorage 永続化処理

### 1.3 対象外
- サーバーサイド API 連携
- 認証、認可
- 外部データベース連携
- メール送信、CSV 出力、分析グラフ

## 2. システム構成

### 2.1 モジュール構成
| 区分 | ファイル | 役割 |
|---|---|---|
| エントリー | src/main.js | 管理画面の初期化、イベント登録、再描画を統括する |
| 画面制御 | src/core/admin-manager.js | 注文データの CRUD、正規化、集計、永続化を担当する |
| UI | src/ui/admin-components.js | 注文一覧、顧客一覧、通知、編集フォーム反映を担当する |
| スタイル | src/styles/admin-style.js | テーマ、スクロール状態、アニメーション補助を管理する |
| 定数 | src/constants/admin-constants.js | ステータス、検証閾値、UI 文言、保存キーを定義する |
| 入力検証 | src/utils/order-validator.js | 注文フォーム入力値の妥当性を検証する |
| セキュリティ | src/utils/xss.js | サニタイズ、HTML エスケープ、簡易検証を担当する |

### 2.2 起動シーケンス
1. index.html が src/main.js を module として読み込む。
2. main.js が AdminManager のシングルトンと AdminStyleManager を生成する。
3. initializeDashboard() がテーマ、レスポンシブ補助、ヘッダー状態、イベントを初期化する。
4. updateDashboard() が注文件数、売上、注文一覧、顧客一覧を描画する。
5. フォーム送信または一覧ボタン押下時に CRUD を実行し、成功後に updateDashboard() を再実行する。

## 3. データ設計

### 3.1 LocalStorage
| キー | 用途 | 保存値 |
|---|---|---|
| adminOrders | 管理画面の注文一覧保持 | 標準化済み注文配列 |
| adminTheme | テーマ状態保持 | light または dark |

### 3.2 注文データ標準形式
| 項目 | 型 | 内容 |
|---|---|---|
| id | string | 注文 ID。ORD- で始まる一意文字列 |
| customerName | string | 顧客名 |
| email | string | メールアドレス |
| productCode | string | 商品コード |
| quantity | number | 注文数量 |
| totalPrice | number | 合計金額 |
| status | string | pending, processing, shipped, delivered, cancelled |
| createdAt | string | 作成日時 ISO 文字列 |
| updatedAt | string | 更新日時 ISO 文字列 |

### 3.3 旧データ互換
未来商店商材側の旧注文形式を normalizeOrderRecord() で吸収する。

| 旧キー | 変換先 |
|---|---|
| customer | customerName |
| customerEmail, mail | email |
| items | productCode |
| price | totalPrice |
| date | createdAt, updatedAt |
| 準備中, 発送済み など | processing, shipped など |

### 3.4 定数・識別子

定数の具体値は `docs/定数定義書.adoc`、識別子の種別値は `docs/コード定義書.adoc` を参照すること。

## 4. 設計方針

### 4.1 シングルトン構造

AdminManager はモジュールスコープのシングルトンとして管理し、全 CRUD 操作とストレージアクセスを集約する。複数の呼び出し元が同一インスタンスを参照することで注文データの一貫性を維持する。

### 4.2 旧データ互換

未来商店商材の旧注文形式（customer / price 等のキー名）は、AdminManager.normalizeOrderRecord() が読み込み時に自動変換する。管理画面側は常に標準形式のみを扱う。

### 4.3 CRUD 後の再描画

全 CRUD 操作の成功後に updateDashboard() を実行し、統計カード・注文一覧・顧客一覧を一括再描画する。部分更新を行わないことで表示の一貫性を保つ。

### 4.4 XSS 対策

xss.js の XSSProtection.escape() でサニタイズした値を localStorage に保存し、画面への反映は textContent に限定する。

## 5. 関連ドキュメント

| ドキュメント | 内容 |
|---|---|
| README.md | プロジェクト概要・実行手順 |
| SCREEN-OVERVIEW.md | 画面構成・遷移・UI 説明 |
| docs/機能設計書.adoc | クラス・メソッド・分岐単位の詳細仕様 |
| docs/コード定義書.adoc | 識別子・種別コードの定義 |
| docs/定数定義書.adoc | 定数値・設定値一覧 |
