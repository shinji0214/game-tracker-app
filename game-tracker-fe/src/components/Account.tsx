import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

    // 記録データの型定義
    interface PlayRecord {
    id: string;
    date: string;
    game_title: string;
    cost: number;
    play_count: number;
    created_at: string;
    }

export default function Account({ session }: { session: any }) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<PlayRecord[]>([]);
    // 編集中のレコードの状態
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PlayRecord | null>(null);
    
    // フォームの入力状態 (Cの機能はそのまま)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
    const [gameTitle, setGameTitle] = useState('');
    const [cost, setCost] = useState(0);
    const [playCount, setPlayCount] = useState(0);

    // 記録データをSupabaseから取得する関数
    const fetchRecords = async () => {
        setLoading(true);
        // RLSが設定されているため、auth.uid()は不要。
        // ログインユーザーに紐づくデータのみが自動で取得される
        const { data, error } = await supabase
        .from('play_records')
        .select('id, date, game_title, cost, play_count, created_at') // 必要なカラムを指定
        .order('date', { ascending: false }); // 日付の新しい順に並べ替え

        if (error) {
        alert(`データ取得エラー: ${error.message}`);
        } else {
        setRecords(data as PlayRecord[]); // 取得したデータを状態に保存
        }
        setLoading(false);
    };
  
    // コンポーネントがマウントされたとき、および依存配列が変更されたときに実行
    useEffect(() => {
        fetchRecords();
    }, []); // 👈 最初のマウント時のみ実行

    // ログアウト処理 (省略)
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // 記録をSupabaseに挿入する処理 (handleSubmit関数内での処理の追加)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // ... (レコードの定義は以前と同じ)
        const record = {
        user_id: session.user.id, 
        date: date,
        game_title: gameTitle,
        cost: cost,
        play_count: playCount,
        };

        const { error } = await supabase
        .from('play_records')
        .insert([record]);

        if (error) {
        alert(`記録エラー: ${error.message}`);
        } else {
        alert('ゲーム記録が保存されました！');
        // 挿入成功後、データを再取得してリストを更新
        await fetchRecords(); // 👈 ここでデータを更新
        // フォームをリセット
        setGameTitle('');
        setCost(0);
        setPlayCount(0);
        }
        setLoading(false);
    };

    // 記録を削除する処理
    const handleDelete = async (id: string) => {
    if (!window.confirm('この記録を削除してもよろしいですか？')) {
        return;
    }
    setLoading(true);

    // RLSポリシーにより、自分のデータのみ削除可能
    const { error } = await supabase
        .from('play_records')
        .delete()
        .eq('id', id); // 👈 削除したいレコードのIDを指定

    if (error) {
        alert(`削除エラー: ${error.message}`);
    } else {
        alert('記録を削除しました。');
        // 削除成功後、リストを更新
        await fetchRecords();
    }
    setLoading(false);
    };
  
    // 編集フォームコンポーネント (Accountコンポーネント内に関数として定義)
    const EditForm = () => {
    if (!editingRecord) return null;

    // フォームの入力値をローカルで管理
    const [editGameTitle, setEditGameTitle] = useState(editingRecord.game_title);
    const [editCost, setEditCost] = useState(editingRecord.cost);
    const [editPlayCount, setEditPlayCount] = useState(editingRecord.play_count);
    const [editDate, setEditDate] = useState(editingRecord.date);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const updatedRecord = {
        date: editDate,
        game_title: editGameTitle,
        cost: editCost,
        play_count: editPlayCount,
        // updated_at はトリガーで自動更新される
        };

        // 👈 データを更新 (Update)
        const { error } = await supabase
        .from('play_records')
        .update(updatedRecord)
        .eq('id', editingRecord.id); // 👈 更新したいレコードのIDを指定

        if (error) {
        alert(`更新エラー: ${error.message}`);
        } else {
        alert('記録を更新しました！');
        setIsEditing(false);
        setEditingRecord(null);
        await fetchRecords(); // リストを更新
        }
        setLoading(false);
    };
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
            <h3>記録を編集</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* ... フォームの input 要素群 ... */}
            <label>日付: <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required /></label>
            <label>ゲーム名: <input type="text" value={editGameTitle} onChange={(e) => setEditGameTitle(e.target.value)} required /></label>
            <label>金額 (円): <input type="number" value={editCost} onChange={(e) => setEditCost(parseInt(e.target.value))} required min="0" /></label>
            <label>回数: <input type="number" value={editPlayCount} onChange={(e) => setEditPlayCount(parseInt(e.target.value))} required min="1" /></label>
            
            <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? '更新中...' : '更新を確定'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} disabled={loading}>
                キャンセル
            </button>
            </form>
        </div>
        </div>
        );
    };
    

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
        <h2>ようこそ、{session.user.email}さん！</h2>
        <button onClick={handleLogout} style={{ marginBottom: '20px' }}>ログアウト</button>

        {/* 記録フォーム (省略) */}
        <h3>新しい記録を追加</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #ddd', padding: '15px', marginBottom: '30px' }}>
            {/* ... (フォームの input 要素群は省略せずに記述) */}
            <label>日付: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
            <label>ゲーム名: <input type="text" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} required /></label>
            <label>使った金額 (円): <input type="number" value={cost} onChange={(e) => setCost(parseInt(e.target.value))} required min="0" /></label>
            <label>プレイ回数: <input type="number" value={playCount} onChange={(e) => setPlayCount(parseInt(e.target.value))} required min="1" /></label>
            <button type="submit" disabled={loading}>
            {loading ? '処理中...' : '記録を保存'}
            </button>
        </form>

        {/* 記録一覧の表示エリア (Rの機能) */}
        <h3>過去の記録 ({records.length}件)</h3>
        {loading && <p>データを読み込み中...</p>}
        
        {!loading && records.length === 0 && (
            <p>まだ記録がありません。フォームから追加してください。</p>
        )}

        {/* 記録リスト */}
        {!loading && records.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
            {records.map((record) => (
                <li key={record.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                    <div>
                        <strong>{record.date}</strong>: {record.game_title}
                        <br />
                        金額: {record.cost}円, 回数: {record.play_count}回
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                    {/* 👈 編集ボタンを追加 */}
                    <button 
                        onClick={() => { setIsEditing(true); setEditingRecord(record); }}
                        disabled={loading}
                        style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '5px 10px' }}
                    >
                        編集
                    </button>
                    {/* 削除ボタン*/}
                    <button 
                        onClick={() => handleDelete(record.id)} 
                        disabled={loading}
                        style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                        >
                        削除
                        </button>
                    </div>
                </li>
                ))}
            </ul>
        )}
        {/* 編集フォーム (isEditing が true の場合のみ表示) */}
        {isEditing && <EditForm />}
        </div>
    );
    }