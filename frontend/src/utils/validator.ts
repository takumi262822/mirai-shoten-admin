import { OrderFormData, OrderStatus, OrderItemFormData } from '../types/index';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES: OrderStatus[] = [
  'pending', 'processing', 'shipped', 'delivered', 'cancelled',
];

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * 注文フォームのバリデーションを実行し、エラーがあればフィールド名→メッセージのオブジェクトを返す。
 * エラーなしの場合は空オブジェクト {} を返す。
 */
export function validateOrderForm(data: OrderFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.customer_name.trim()) {
    errors.customer_name = '顧客名は必須です';
  } else if (data.customer_name.trim().length > 100) {
    errors.customer_name = '顧客名は100文字以内で入力してください';
  }

  if (!data.email.trim()) {
    errors.email = 'メールアドレスは必須です';
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'メールアドレスの形式が正しくありません';
  }

  const price = Number(data.total_price);
  if (data.total_price !== '' && (isNaN(price) || price < 0)) {
    errors.total_price = '合計金額は0以上の数値を入力してください';
  }

  if (!VALID_STATUSES.includes(data.status)) {
    errors.status = '無効なステータスです';
  }

  data.items.forEach((item: OrderItemFormData, i: number) => {
    if (!item.product_name.trim()) {
      errors[`items.${i}.product_name`] = '商品名は必須です';
    }
    const qty = Number(item.quantity);
    if (isNaN(qty) || qty < 1 || qty > 999) {
      errors[`items.${i}.quantity`] = '数量は1〜999で入力してください';
    }
    const price = Number(item.unit_price);
    if (isNaN(price) || price < 0) {
      errors[`items.${i}.unit_price`] = '単価は0以上の数値を入力してください';
    }
  });
  // 型明示
  // data.items.forEach((item: OrderItemFormData, i: number) => {...})

  return errors;
}

/** ログインフォームのバリデーション */
export function validateLoginForm(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!email.trim()) errors.email = 'メールアドレスは必須です';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'メールアドレスの形式が正しくありません';
  if (!password) errors.password = 'パスワードは必須です';
  return errors;
}
