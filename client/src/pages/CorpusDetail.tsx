import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { corpusAPI } from '../api';
import type { Corpus, Sentence } from '../types';
import { ArrowLeft, Star, Clock, Play, Pause } from 'lucide-react';

const DIFFICULTY_LABELS = ['', '入门', '初级', '中级', '中高级', '高级'];

export default function CorpusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [subtitleMode, setSubtitleMode] = useState<'none' | 'english' | 'bilingual'>('english');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    corpusAPI.detail(parseInt(id))
      .then((res) => {
        setCorpus(res.data.data!.corpus);
        setSentences(res.data.data!.sentences);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Track current sentence via timeupdate
  function handleTimeUpdate() {
    const t = videoRef.current?.currentTime ?? 0;
    const idx = sentences.findIndex((s) => t >= s.start_time && t <= s.end_time);
    if (idx !== currentIndex) setCurrentIndex(idx);
  }

  function seekTo(s: Sentence) {
    if (videoRef.current) {
      videoRef.current.currentTime = s.start_time;
      videoRef.current.play();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!corpus) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">语料未找到</p>
        <Link to="/corpus" className="text-blue-600 hover:underline mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  const currentSentence = sentences[currentIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600">首页</Link>
        <span>/</span>
        <Link to="/corpus" className="hover:text-blue-600">语料库</Link>
        <span>/</span>
        <span className="text-gray-600">{corpus.title}</span>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{corpus.title}</h1>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{corpus.scenario}</span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <Star className="w-4 h-4" /> {DIFFICULTY_LABELS[corpus.difficulty]}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {Math.floor(corpus.duration_seconds / 60)}m {corpus.duration_seconds % 60}s
        </span>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-xl overflow-hidden mb-4 relative">
        <video
          ref={videoRef}
          src={corpus.video_url}
          className="w-full aspect-video"
          controls
          onTimeUpdate={handleTimeUpdate}
          poster={corpus.thumbnail_url}
        />
        {/* Subtitle overlay */}
        {subtitleMode !== 'none' && currentSentence && (
          <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none px-4">
            <p className="inline-block bg-black/70 text-white px-4 py-2 rounded-lg text-lg max-w-3xl">
              {currentSentence.english_text}
            </p>
            {subtitleMode === 'bilingual' && currentSentence.chinese_text && (
              <p className="inline-block bg-black/50 text-gray-300 px-4 py-1 rounded-lg text-sm mt-1">
                {currentSentence.chinese_text}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Subtitle controls */}
      <div className="flex items-center gap-3 mb-6">
        {(['none', 'english', 'bilingual'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSubtitleMode(mode)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              subtitleMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode === 'none' ? '无字幕' : mode === 'english' ? '英文' : '双语'}
          </button>
        ))}
      </div>

      {/* Start Dictation button */}
      <button
        onClick={() => navigate(`/corpus/${corpus.id}/learn`)}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-8"
      >
        开始听写
      </button>

      {/* Sentence list */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">句子列表（{sentences.length}句）</h3>
        {sentences.map((s, i) => (
          <button
            key={s.id}
            onClick={() => seekTo(s)}
            className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
              i === currentIndex ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
          >
            <span className="text-xs text-gray-400 font-mono mt-1 w-8 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{s.english_text}</p>
              {s.chinese_text && (
                <p className="text-xs text-gray-400 mt-0.5">{s.chinese_text}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono mt-1 shrink-0">
              {formatTime(s.start_time)}–{formatTime(s.end_time)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
