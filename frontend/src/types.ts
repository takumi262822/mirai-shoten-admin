export type OrderStatus = '未処理' | '処理中' | '完了' | 'キャンセル';

export const STATUS_COLORS: Record<OrderStatus, string> = {
  '未処理': 'gray',
  '処理中': 'blue',
  '完了': 'green',
  'キャンセル': 'red',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  '未処理': '未処理',
  '処理中': '処理中',
  '完了': '完了',
  'キャンセル': 'キャンセル',
};
