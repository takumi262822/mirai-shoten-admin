# API仕様書

## GET /api/orders
- 概要: 注文一覧を取得
- レスポンス例:
```json
[
  {
    "id": "uuid",
    "customer_name": "山田 太郎",
    "email": "taro@example.com",
    "phone": "090-xxxx-xxxx",
    "address": "東京都...",
    "status": "pending",
    "total_price": 12000,
    "created_at": "2026-04-10T12:00:00Z",
    "updated_at": "2026-04-10T12:00:00Z"
  }
]
```

## GET /api/stats
- 概要: 注文統計情報を取得
- レスポンス例:
```json
{
  "totalOrders": 10,
  "totalRevenue": 120000,
  "byStatus": {
    "pending": 2,
    "completed": 7,
    "cancelled": 1
  }
}
```

## 認証
- JWT（JSON Web Token）による認証
- 認証が必要なエンドポイントには、リクエストヘッダー `Authorization: Bearer <JWT>` を付与してください。
- Supabaseサービスロールキーはバックエンドの環境変数で管理
