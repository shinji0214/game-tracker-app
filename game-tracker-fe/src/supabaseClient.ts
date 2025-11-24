import { createClient } from '@supabase/supabase-js';

// 1. .envファイルから環境変数を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているかチェック
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Key is missing in the .env file. Please check .env and its contents.");
}

// 2. 接続クライアントを作成し、エクスポートする
// この 'supabase' オブジェクトを他のコンポーネントでインポートして使用します。
export const supabase = createClient(supabaseUrl, supabaseAnonKey);