# ER図（Entity Relationship Diagram）

## orders テーブル

| カラム名       | 型          | NULL許可 | 主キー | 備考         |
|:--------------|:------------|:--------|:------|:-------------|
| id            | uuid        | NO      | YES   | 自動生成     |
| customer_name | text        | NO      | NO    |              |
| email         | text        | NO      | NO    |              |
| phone         | text        | YES     | NO    |              |
| address       | text        | YES     | NO    |              |
| status        | text        | NO      | NO    |              |
| total_price   | numeric     | YES     | NO    |              |
| created_at    | timestamptz | NO      | NO    | 自動生成     |
| updated_at    | timestamptz | YES     | NO    |              |

## order_items テーブル

| カラム名       | 型          | NULL許可 | 主キー | 備考         |
|:--------------|:------------|:--------|:------|:-------------|
| id            | uuid        | NO      | YES   | 自動生成     |
| order_id      | uuid        | NO      | NO    | orders.idへの外部キー |
| product_name  | text        | NO      | NO    |              |
| quantity      | int4        | NO      | NO    |              |
| price         | numeric     | NO      | NO    |              |
| created_at    | timestamptz | NO      | NO    | 自動生成     |
| updated_at    | timestamptz | YES     | NO    |              |
