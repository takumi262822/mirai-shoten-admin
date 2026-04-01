# Mirai Shoten Admin

企業提出向けに整備した、未来商店向けの管理ダッシュボードです。ES Modules と責務分離により、注文管理・顧客確認・売上把握を1画面で扱える構成にしています。

このプロジェクトは `未来商店商材` に対応する管理画面です。
単独のECサービスではなく、`未来商店商材` の注文データを管理・確認するための運用画面として設計しています。

## 1. 採用担当向けサマリー

- 目的: 管理画面の CRUD 実装力と運用視点の UI 設計力を示す提出物
- 想定閲覧時間: 5-10分
- 見てほしい点: CRUD 設計、LocalStorage 運用、入力検証、XSS 対策、ダッシュボードUI

## 2. 作成者情報

- 作成者: Takumi Harada
- 作成日: 2026-04-01
- ドキュメント最終更新日: 2026-04-01

## 3. ディレクトリ構成

```text
mirai-shoten-admin/
  index.html
  src/
    constants/
    core/
    styles/
    ui/
    utils/
```

## 4. 実行方法

```powershell
cd C:\テスト\mirai-shoten-admin
python -m http.server 5505
```

ブラウザで `http://localhost:5505/index.html` を開きます。

## 5. 品質チェック（Lint / Test）

```powershell
cd C:\テスト\mirai-shoten-admin
npm install
npm run lint
npm test
```

CI: `.github/workflows/ci.yml`

## 6. 5分評価ガイド

1. ダッシュボード起動後に注文一覧と集計カードを確認
2. 新規注文を追加して、件数・売上・顧客情報が更新されることを確認
3. 既存注文の編集と削除を確認
4. ステータス変更とテーマ切替を確認
5. `src/core/admin-manager.js` と `src/ui/admin-components.js` を確認

## 7. 実装の工夫

- 注文CRUDを `AdminManager` に集約して状態管理を単純化
- 表示ロジックを `AdminUIComponents` に分離して描画責務を限定
- `OrderValidator` と `XSSProtectionAdmin` を分離して入力安全性を確保
- 未来商店商材の注文データ形式との互換読込を実装

## 8. 対応環境・既知の制約

- 推奨ブラウザ: Chrome / Edge の最新安定版
- データ保存先: LocalStorage（`adminOrders`）
- 既知の制約: バックエンド/API なし、ローカル管理画面として動作

## 9. 今後の改善

- 売上分析グラフの追加
- 認証/認可の導入
- API 連携版への発展

## 10. 提出チェックリスト

- [ ] 起動手順が再現できる
- [ ] `npm run lint` / `npm test` が通る
- [ ] 注文追加・編集・削除が動作する
- [ ] 既存注文データ互換の説明ができる

## 11. 関連プロジェクト

- 対応する利用者向け画面: `../未来商店商材`
- 他の独立作品とは非連携: `../godufo-game`, `../quiz-game`, `../脱出ゲーム`
