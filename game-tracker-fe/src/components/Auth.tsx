import { useState } from 'react';
import { supabase } from '../supabaseClient'; // 作成済みのクライアントをインポート

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // サインイン/サインアップ処理
  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // エラーメッセージを表示
      alert(`認証エラー: ${error.message}`);
    } else {
      // 成功メッセージを表示
      alert(isSignUp ? '登録完了！メールを確認してください。' : 'ログインしました！');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>ゲームトラッカー</h2>
      <p>サインインまたはサインアップ</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={(e) => handleAuth(e, false)} disabled={loading}>
          {loading ? '処理中...' : 'サインイン'}
        </button>
        <button onClick={(e) => handleAuth(e, true)} disabled={loading}>
          {loading ? '処理中...' : 'サインアップ'}
        </button>
      </form>
    </div>
  );
}