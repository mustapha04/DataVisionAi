import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Loader2, Bot, User, Trash2 } from 'lucide-react';
import type { ColumnMeta } from '@/types';
import { supabase } from '@/services/supabase';
import { sendChatMessage } from '@/services/api';

interface LocalData { rows: any[]; meta: ColumnMeta[]; fileName: string; }

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  tokens?: number;
}

const SUGGESTIONS = [
  "Summarize my dataset",
  "What are the top revenue products?",
  "Show me pricing trends",
  "What are the growth opportunities?",
  "Are there any anomalies?",
  "How can I increase conversions?",
];

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocalData | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading && data) {
      inputRef.current?.focus();
    }
  }, [loading, data]);

  async function loadData() {
    setLoading(true);
    try {
      if (id?.startsWith('local-')) {
        const stored = sessionStorage.getItem(id!);
        if (stored) { setData(JSON.parse(stored)); setLoading(false); return; }
      }
      const { data: ds } = await supabase.from('datasets').select('*').eq('id', id!).single();
      if (!ds) throw new Error('Not found');
      const preview = ds.preview_data || {};
      setData({ rows: preview.rows || [], meta: ds.columns_meta || [], fileName: ds.file_name });
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  async function handleSend(message?: string) {
    const msg = (message || input).trim();
    if (!msg || !id || sending) return;

    setInput('');
    setSending(true);

    const userMsg: ChatMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    try {
      const isLocal = id.startsWith('local-');
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(
        id, msg, history,
        isLocal ? (data?.rows || []) : [],
        isLocal ? (data?.meta || []) : [],
      );

      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: res.reply || 'No response from AI.',
        model: res.model_used,
        tokens: res.tokens_used,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err.message || 'Failed to get response';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errMsg}. Please try again.`,
      }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading dataset...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <div>No data found. <a onClick={() => navigate('/app')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Upload a dataset</a></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
        padding: '14px 20px', borderRadius: 12, background: 'var(--card)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(59,130,246,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI Data Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {data.fileName} · {data.rows.length} rows · {data.meta.length} columns
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-sm" onClick={clearChat}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 4px',
        display: 'flex', flexDirection: 'column', gap: 12,
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(59,130,246,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Ask anything about your data</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 400 }}>
                The AI assistant analyzes your {data.rows.length}-row dataset and answers questions about trends, anomalies, pricing, and growth opportunities.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="btn" onClick={() => handleSend(s)}
                  style={{ fontSize: 12, padding: '6px 14px' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(59,130,246,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={16} style={{ color: 'var(--accent)' }} />
              </div>
            )}
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: 12,
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
              color: msg.role === 'user' ? '#0a0e1a' : 'var(--text)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
              {msg.model && msg.role === 'assistant' && (
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  {msg.model} · {msg.tokens} tokens
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} style={{ color: '#0a0e1a' }} />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(59,130,246,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'var(--card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        marginTop: 12, padding: '12px 16px', borderRadius: 12,
        background: 'var(--card)', border: '1px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your data..."
          disabled={sending}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending}
          style={{
            width: 36, height: 36, borderRadius: 8, border: 'none',
            background: input.trim() && !sending ? 'var(--accent)' : 'var(--surface)',
            color: input.trim() && !sending ? '#0a0e1a' : 'var(--muted)',
            cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
