import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import Auth from './components/Auth'; // ログイン/サインアップ画面
import Account from './components/Account';

// アプリのメインコンポーネント
function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 認証状態の取得
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
    });

    // 認証状態の変化を監視（ログイン/ログアウト時）
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      // リスナーのクリーンアップ
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container">
      {/* セッションがあればメインアプリ（Account）、なければログイン画面（Auth）を表示 */}
      {session ? <Account session={session} /> : <Auth />}
    </div>
  );
}

export default App
