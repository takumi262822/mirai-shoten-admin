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

### 3.4 定数定義

#### 3.4.1 AdminConstants.ORDER_STATUS
- PENDING: pending
- PROCESSING: processing
- SHIPPED: shipped
- DELIVERED: delivered
- CANCELLED: cancelled

#### 3.4.2 AdminConstants.VALIDATION
- MIN_CUSTOMER_NAME: 1
- MAX_CUSTOMER_NAME: 50
- MIN_QUANTITY: 1
- MAX_QUANTITY: 999
- MIN_PRICE: 0
- MAX_PRICE: 999999

## 4. 詳細設計

### 4.1 src/main.js

#### 4.1.1 initializeDashboard
- I/F:
  - 入力: なし
  - 出力: 初期化済みダッシュボード画面
- 設定値:
  - テーマ保存先: adminTheme
- 処理:
  1. styleManager.initTheme() を実行する。
  2. styleManager.applyResponsiveCSS() を実行する。
  3. styleManager.initHeaderScrollState() を実行する。
  4. テーマトグル表示を同期する。
  5. フォーム送信、編集キャンセル、テーマ切替イベントを登録する。
  6. updateDashboard() を実行する。
- 分岐:
  - a. テーマ保存値が存在する場合: 保存値を利用する。
  - b. 保存値がない場合: light を既定値として適用する。

#### 4.1.2 handleFormSubmit
- I/F:
  - 入力: submit event
  - 出力: 注文追加または更新結果の通知表示
- 設定値:
  - editingOrderId が null なら新規追加
- 処理:
  1. event.preventDefault() を実行する。
  2. collectFormData() で入力値を取得する。
  3. editingOrderId の有無で addOrder または editOrder を呼ぶ。
  4. 失敗時はエラー通知を表示して終了する。
  5. 成功時は成功通知、フォーム初期化、再描画を行う。
- 分岐:
  - a. editingOrderId がある場合: 編集処理へ進む。
  - b. editingOrderId がない場合: 新規追加処理へ進む。
  - c. 検証失敗時: 再描画せず通知のみ表示する。

#### 4.1.3 updateDashboard
- I/F:
  - 入力: AdminManager が保持する注文一覧
  - 出力: 統計カード、注文一覧、顧客一覧の DOM 更新
- 設定値:
  - 集計対象: totalOrders, totalRevenue, processingCount, deliveredCount
- 処理:
  1. getAllOrders() と getStatistics() を取得する。
  2. 統計カードの数値を書き換える。
  3. renderOrderTable() と renderCustomerInfo() を実行する。
  4. attachTableEventListeners() で再描画後のボタンにイベントを再登録する。

### 4.2 AdminManager クラス

#### 4.2.1 constructor
- I/F:
  - 入力: なし
  - 出力: orders, storageKey を保持したインスタンス
- 設定値:
  - storageKey: AdminConstants.STORAGE_KEYS.ADMIN_ORDERS
- 処理:
  1. orders を空配列で初期化する。
  2. storageKey を設定する。
  3. loadOrdersFromStorage() を実行する。

#### 4.2.2 loadOrdersFromStorage
- I/F:
  - 入力: LocalStorage 内の adminOrders
  - 出力: this.orders 更新
- 処理:
  1. LocalStorage から文字列を取得する。
  2. JSON.parse() で配列化する。
  3. normalizeOrderRecord() を各要素へ適用する。
  4. falsy を除去して this.orders に格納する。
- 分岐:
  - a. 保存値がない場合: 空配列を設定する。
  - b. JSON 解析に失敗した場合: 警告を出して空配列に戻す。

#### 4.2.3 normalizeOrderRecord
- I/F:
  - 入力: rawOrder
  - 出力: 標準形式の注文オブジェクト
- 設定値:
  - 未設定時顧客名: 未設定
  - 未設定時商品コード: UNSPECIFIED
- 処理:
  1. 新旧キーを吸収して顧客名、メール、商品コード、数量、金額、ステータスを作る。
  2. normalizeTextField、normalizeQuantity、normalizePrice、normalizeStatus を適用する。
  3. createdAt と updatedAt を補完する。
- 分岐:
  - a. 入力が object でない場合: null を返す。
  - b. 旧形式のキーしかない場合: 対応表に従って変換する。

#### 4.2.4 addOrder
- I/F:
  - 入力: customerName, email, productCode, quantity, totalPrice, status
  - 出力: success, orderId, message
- 処理:
  1. OrderValidator.isValidOrderData() で妥当性を確認する。
  2. 各入力値を sanitizeInput() する。
  3. 注文 ID を生成する。
  4. createdAt, updatedAt を付与して orders に push する。
  5. saveOrdersToStorage() で保存する。
- 分岐:
  - a. 検証失敗時: success false を返す。
  - b. status 未指定時: pending を補完する。

#### 4.2.5 editOrder
- I/F:
  - 入力: orderId, updates
  - 出力: success, message
- 処理:
  1. orderId に一致する index を検索する。
  2. 既存値をベースに更新値をサニタイズしてマージする。
  3. 妥当性検証を実行する。
  4. updatedAt を現在時刻で更新する。
  5. 配列へ上書きし保存する。
- 分岐:
  - a. 対象注文が存在しない場合: 失敗を返す。
  - b. 更新内容が不正な場合: 失敗を返す。

#### 4.2.6 deleteOrder
- I/F:
  - 入力: orderId
  - 出力: success, message
- 処理:
  1. 対象 index を検索する。
  2. 見つかれば splice() で削除する。
  3. saveOrdersToStorage() を実行する。
- 分岐:
  - a. 対象が存在しない場合: 失敗を返す。
  - b. 対象が存在する場合: 削除成功を返す。

#### 4.2.7 getStatistics
- I/F:
  - 入力: this.orders
  - 出力: totalOrders, totalRevenue, byStatus
- 処理:
  1. ORDER_STATUS を走査して byStatus を 0 初期化する。
  2. 注文一覧を走査し、金額合計とステータス件数を加算する。

### 4.3 AdminUIComponents クラス

#### 4.3.1 renderOrderTable
- I/F:
  - 入力: orders, containerId
  - 出力: 注文テーブル HTML
- 処理:
  1. コンテナを取得する。
  2. 注文が空なら空状態メッセージを表示する。
  3. 注文ごとに顧客名、メール、ID を escape() する。
  4. 編集・削除ボタン付きの table HTML を生成する。
  5. innerHTML に反映する。
- 分岐:
  - a. コンテナが存在しない場合: エラーを出して終了する。
  - b. 注文が空の場合: 空表示のみ返す。

#### 4.3.2 renderCustomerInfo
- I/F:
  - 入力: orders, containerId
  - 出力: 顧客集約テーブル
- 処理:
  1. email をキーに Map を作る。
  2. orderCount と totalSpent を顧客単位で加算する。
  3. エスケープ済みの一覧 HTML を生成する。
  4. innerHTML に反映する。

#### 4.3.3 showNotice
- I/F:
  - 入力: message, type
  - 出力: 通知 DOM
- 処理:
  1. 既存通知を削除する。
  2. 通知要素を生成して色を設定する。
  3. body に追加し、3 秒後に削除する。
- 分岐:
  - a. type が success の場合: 緑系背景を適用する。
  - b. それ以外の場合: エラー色を適用する。

### 4.4 OrderValidator クラス

#### 4.4.1 isValidOrderData
- I/F:
  - 入力: orderData
  - 出力: boolean
- 処理:
  1. 注文オブジェクト存在確認を行う。
  2. 顧客名、メール、商品コード、数量、金額、ステータスを順に検証する。
  3. すべて valid の場合のみ true を返す。

#### 4.4.2 個別検証メソッド
- isValidCustomerName:
  - 1 文字以上 50 文字以下か、日本語・英数字・空白のみかを確認する。
- isValidEmail:
  - XSSProtectionAdmin.isValidEmail() を用いて形式確認する。
- isValidProductCode:
  - 1 文字以上 10 文字以下か、英数字とハイフンのみかを確認する。
- isValidQuantity:
  - 整数かつ 1 から 999 の範囲かを確認する。
- isValidTotalPrice:
  - 数値であり 0 から 999999 の範囲かを確認する。
- isValidStatus:
  - ORDER_STATUS に含まれる値かを確認する。

### 4.5 AdminStyleManager クラス

#### 4.5.1 initTheme
- I/F:
  - 入力: LocalStorage 内の adminTheme
  - 出力: body data-theme 更新
- 処理:
  1. 保存済みテーマを取得する。
  2. 未設定時は light を使う。
  3. applyTheme() を実行する。

#### 4.5.2 toggleDarkMode
- I/F:
  - 入力: currentTheme
  - 出力: 反転後テーマ適用
- 処理:
  1. currentTheme が light か dark かを判定する。
  2. 反対のテーマを applyTheme() に渡す。

#### 4.5.3 applyResponsiveCSS
- I/F:
  - 入力: cursor-glow 要素、mousemove event
  - 出力: CSS 変数 --x, --y 更新
- 処理:
  1. cursor-glow 要素を取得する。
  2. mousemove 時に座標を CSS 変数へ反映する。
- 分岐:
  - a. cursor-glow が存在しない場合: 何も行わない。

## 5. テスト設計

### 5.1 自動テスト対象
- src/core/admin-manager.test.js:
  - 旧保存形式の正規化
  - customerEmail 互換読込
  - 注文追加後の保存と集計更新
  - 売上合計とステータス集計
- src/utils/order-validator.test.js:
  - 顧客名、メール、商品コード、数量、金額、ステータス検証
- src/utils/xss.test.js:
  - escape、sanitizeInput、normalizeFullWidthAscii
- src/constants/admin-constants.test.js:
  - 定数契約と値の整合

### 5.2 手動確認対象
- 注文追加から一覧反映までの導線
- 編集開始、更新、キャンセル操作
- 削除確認ダイアログと削除後再描画
- ダークモード切替とリロード後保持

## 6. 既知制約
- 永続化は LocalStorage のため複数端末共有はできない。
- UI 回帰テストは未導入で、レイアウト確認は手動で実施する。
- 認証と権限制御は未実装で、ポートフォリオ向けの単体管理画面として提供する。
