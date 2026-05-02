import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningAPI, vocabularyAPI } from '../api';
import type { LearningStats, LearningRecord, Vocabulary } from '../types';
import { Clock, Target, CheckCircle2, MessageSquare, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

type Tab = 'records' | 'vocabulary';

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('records');
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);

  useEffect(() => {
    learningAPI.getStats().then((res) => setStats(res.data.data!));
    learningAPI.getRecords({ limit: 50 }).then((res) => setRecords(res.data.data!.list));
    vocabularyAPI.list().then((res) => setVocabulary(res.data.data!.list));
  }, []);

  async function handleDeleteVocab(id: number) {
    await vocabularyAPI.delete(id);
    setVocabulary((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleChangeMastery(vocab: Vocabulary, delta: number) {
    const newLevel = Math.max(0, Math.min(3, vocab.mastery_level + delta));
    await vocabularyAPI.update(vocab.id, { mastery_level: newLevel });
    setVocabulary((prev) => prev.map((v) => v.id === vocab.id ? { ...v, mastery_level: newLevel } : v));
  }

  const MASTERY_LABELS = ['新词', '学习中', '已熟悉', '已掌握'];
  const MASTERY_COLORS = ['bg-gray-100 text-gray-600', 'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* User info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-xl font-bold text-gray-800">{user?.nickname}</h1>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: CheckCircle2, label: '学习次数', value: stats.total_sessions, color: 'text-blue-600' },
            { icon: Clock, label: '总时长(小时)', value: (Number(stats.total_duration_seconds) / 3600).toFixed(1), color: 'text-purple-600' },
            { icon: Target, label: '平均正确率', value: `${Number(stats.average_accuracy).toFixed(1)}%`, color: 'text-green-600' },
            { icon: MessageSquare, label: '练习总句数', value: stats.total_sentences_attempted, color: 'text-orange-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {[
          { key: 'records' as Tab, label: '学习记录' },
          { key: 'vocabulary' as Tab, label: '我的生词本' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Records tab */}
      {tab === 'records' && (
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">还没有学习记录。<Link to="/corpus" className="text-blue-600 hover:underline">开始学习</Link></p>
            </div>
          ) : (
            records.map((r) => (
              <Link
                key={r.id}
                to={`/corpus/${r.corpus_id}`}
                className="block bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{r.corpus_title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.created_at).toLocaleDateString()} · 全对 {r.correct_sentences}/{r.total_sentences}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${r.accuracy >= 80 ? 'text-green-600' : r.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {Number(r.accuracy).toFixed(1)}%
                    </span>
                    <p className="text-xs text-gray-400">
                      {Math.floor(r.duration_seconds / 60)}m {r.duration_seconds % 60}s
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Vocabulary tab */}
      {tab === 'vocabulary' && (
        <div className="space-y-2">
          {vocabulary.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">还没有生词。学习过程中添加的生词会出现在这里。</p>
            </div>
          ) : (
            vocabulary.map((v) => (
              <div key={v.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{v.word}</span>
                  {v.definition && <p className="text-xs text-gray-500 mt-0.5">{v.definition}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleChangeMastery(v, -1)}
                      disabled={v.mastery_level <= 0}
                      className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MASTERY_COLORS[v.mastery_level]}`}>
                      {MASTERY_LABELS[v.mastery_level]}
                    </span>
                    <button
                      onClick={() => handleChangeMastery(v, 1)}
                      disabled={v.mastery_level >= 3}
                      className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteVocab(v.id)}
                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
