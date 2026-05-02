import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { corpusAPI } from '../api';
import type { Corpus } from '../types';
import { Star, Clock, MessageSquare } from 'lucide-react';

const SCENARIOS = ['', 'daily', 'business', 'travel', 'academic', 'entertainment'];
const SCENARIO_LABELS: Record<string, string> = {
  '': '全部', daily: '日常', business: '商务', travel: '旅游', academic: '学术', entertainment: '娱乐',
};
const DIFFICULTY_LABELS = ['', '入门', '初级', '中级', '中高级', '高级'];

export default function CorpusList() {
  const [list, setList] = useState<Corpus[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('');
  const [difficulty, setDifficulty] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = {};
    if (scenario) params.scenario = scenario;
    if (difficulty) params.difficulty = difficulty;
    corpusAPI.list(params)
      .then((res) => setList(res.data.data!.list))
      .finally(() => setLoading(false));
  }, [scenario, difficulty]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">学习素材</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {SCENARIOS.map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                scenario === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {SCENARIO_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                difficulty === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">暂无学习素材</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => (
            <Link
              key={c.id}
              to={`/corpus/${c.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white/80 text-4xl font-light">{c.title[0]}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{c.title}</h3>
                <p className="text-sm text-gray-400 mb-3 truncate">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {DIFFICULTY_LABELS[c.difficulty]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {c.sentence_count} 句
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
