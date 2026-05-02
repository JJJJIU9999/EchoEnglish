import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { corpusAPI, learningAPI } from '../api';
import type { Corpus, Sentence, DictationResult } from '../types';
import { ArrowLeft, Check, X } from 'lucide-react';

type Phase = 'loading' | 'ready' | 'playing' | 'writing' | 'reviewing' | 'done';

function scoreDictation(target: string, userInput: string): DictationResult {
  const targetWords = target.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const userWords = userInput.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);

  const wordResults = [];
  let correctCount = 0;
  const maxLen = Math.max(targetWords.length, userWords.length);

  for (let i = 0; i < maxLen; i++) {
    const word = targetWords[i];
    const userWord = userWords[i];

    if (word && userWord && word === userWord) {
      wordResults.push({ word, userWord, status: 'correct' as const });
      correctCount++;
    } else if (word && userWord) {
      wordResults.push({ word, userWord, status: 'incorrect' as const });
    } else if (word && !userWord) {
      wordResults.push({ word, userWord: null, status: 'missing' as const });
    } else {
      wordResults.push({ word: userWord!, userWord: userWord!, status: 'extra' as const });
    }
  }

  const accuracy = targetWords.length > 0
    ? Math.round((correctCount / targetWords.length) * 100 * 100) / 100
    : 100;

  return { userInput, accuracy, wordResults };
}

export default function Learning() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [results, setResults] = useState<Map<number, DictationResult>>(new Map());
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    if (!id) return;
    corpusAPI.detail(parseInt(id)).then((res) => {
      setCorpus(res.data.data!.corpus);
      setSentences(res.data.data!.sentences);
      setPhase('ready');
    });
  }, [id]);

  const currentSentence = sentences[currentIndex];
  const currentResult = results.get(currentIndex);

  function startDictation() {
    setCurrentIndex(0);
    setResults(new Map());
    setPhase('playing');
    setStartTime(Date.now());
    // Seek to first sentence
    if (sentences[0] && videoRef.current) {
      videoRef.current.currentTime = sentences[0].start_time;
    }
  }

  function handleSentenceEnd() {
    setPhase('writing');
    setUserInput('');
  }

  function handleSubmit() {
    if (!currentSentence || !userInput.trim()) return;
    const result = scoreDictation(currentSentence.english_text, userInput);
    setResults((prev) => new Map(prev).set(currentIndex, result));
    setPhase('reviewing');
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sentences.length) {
      setPhase('done');
    } else {
      setCurrentIndex(nextIndex);
      setPhase('playing');
      if (sentences[nextIndex] && videoRef.current) {
        videoRef.current.currentTime = sentences[nextIndex].start_time;
        videoRef.current.play();
      }
    }
  }

  async function handleSave() {
    const totalSentences = sentences.length;
    const correctSentences = Array.from(results.values()).filter((r) => r.accuracy === 100).length;
    const avgAccuracy = Array.from(results.values()).reduce((sum, r) => sum + r.accuracy, 0) / totalSentences;
    const duration = Math.round((Date.now() - startTime) / 1000);

    await learningAPI.createRecord({
      corpus_id: corpus!.id,
      total_sentences: totalSentences,
      correct_sentences: correctSentences,
      accuracy: Math.round(avgAccuracy * 100) / 100,
      duration_seconds: duration,
    });

    navigate('/profile');
  }

  // ── Render ──

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{corpus?.title}</h1>
        <p className="text-gray-500 mb-8">共 {sentences.length} 句待练习</p>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">听写练习</h2>
          <ol className="text-left text-sm text-gray-500 space-y-2 mb-8">
            <li>1. 仔细聆听每一句</li>
            <li>2. 在输入框中输入你听到的内容</li>
            <li>3. 查看逐词评分结果</li>
            <li>4. 回顾总结，追踪进步</li>
          </ol>
          <button
            onClick={startDictation}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始听写
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const totalSentences = sentences.length;
    const correctSentences = Array.from(results.values()).filter((r) => r.accuracy === 100).length;
    const avgAccuracy = Array.from(results.values()).reduce((sum, r) => sum + r.accuracy, 0) / totalSentences;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">练习完成！</h2>
          <p className="text-gray-500 mb-8">你在《{corpus?.title}》中的表现如下</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '正确率', value: `${avgAccuracy.toFixed(1)}%`, color: avgAccuracy >= 80 ? 'text-green-600' : avgAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600' },
              { label: '全对', value: `${correctSentences}/${totalSentences}`, color: 'text-blue-600' },
              { label: '总句数', value: totalSentences.toString(), color: 'text-gray-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-4">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-8 text-left">
            {sentences.map((s, i) => {
              const r = results.get(i);
              return (
                <div key={s.id} className={`p-3 rounded-lg flex items-start gap-2 ${r ? (r.accuracy === 100 ? 'bg-green-50' : 'bg-yellow-50') : 'bg-gray-50'}`}>
                  {r ? (r.accuracy === 100 ? <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> : <X className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />) : null}
                  <div>
                    <p className="text-sm text-gray-700">{s.english_text}</p>
                    {r && r.accuracy < 100 && (
                      <p className="text-xs text-gray-400 mt-0.5">你的回答：{r.userInput}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              保存并查看统计
            </button>
            <button onClick={startDictation} className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              再来一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing / Writing / Reviewing ──
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/corpus/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Link>
        <span className="text-sm text-gray-400">
          第 {currentIndex + 1} 句 / 共 {sentences.length} 句
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {sentences.map((_, i) => {
          const r = results.get(i);
          let bg = 'bg-gray-200';
          if (r) bg = r.accuracy === 100 ? 'bg-green-500' : r.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500';
          if (i === currentIndex && !r) bg = 'bg-blue-500';
          return <div key={i} className={`flex-1 h-2 rounded-full ${bg} transition-colors`} />;
        })}
      </div>

      {/* Compact video (playing phase) */}
      {phase === 'playing' && currentSentence && (
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <video
            ref={videoRef}
            src={corpus?.video_url}
            className="w-full aspect-video"
            controls
            onEnded={handleSentenceEnd}
            onTimeUpdate={() => {
              if (currentSentence && videoRef.current) {
                const t = videoRef.current.currentTime;
                if (t >= currentSentence.end_time) {
                  videoRef.current.pause();
                }
              }
            }}
            poster={corpus?.thumbnail_url}
          />
        </div>
      )}

      {/* Sentence display */}
      {currentSentence && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          {phase === 'playing' && (
            <div className="text-center">
              <p className="text-xl text-gray-800 mb-4">{currentSentence.english_text}</p>
              <p className="text-sm text-gray-400 mb-4">仔细听...</p>
              <button
                onClick={handleSentenceEnd}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                我准备好了
              </button>
            </div>
          )}

          {(phase === 'writing' || phase === 'reviewing') && (
            <div>
              {phase === 'writing' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">输入你听到的内容：</p>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="在这里输入..."
                    autoFocus
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    提交
                  </button>
                </div>
              )}

              {phase === 'reviewing' && currentResult && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">标准答案：</p>
                  <p className="text-lg text-gray-800">{currentSentence.english_text}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.wordResults.map((w, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-sm font-medium ${
                          w.status === 'correct' ? 'bg-green-100 text-green-800' :
                          w.status === 'incorrect' ? 'bg-red-100 text-red-800' :
                          w.status === 'missing' ? 'bg-gray-100 text-gray-400' :
                          'bg-yellow-100 text-yellow-700 line-through'
                        }`}
                      >
                        {w.status === 'missing' ? w.word : (w.userWord || w.word)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${currentResult.accuracy === 100 ? 'text-green-600' : currentResult.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {currentResult.accuracy.toFixed(1)}%
                    </span>
                    <button
                      onClick={handleNext}
                      className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {currentIndex + 1 >= sentences.length ? '查看结果' : '下一句'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sentence list sidebar */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500 mb-2">全部句子</h3>
        {sentences.map((s, i) => {
          const r = results.get(i);
          return (
            <div
              key={s.id}
              className={`p-2 rounded text-sm flex items-center gap-2 ${
                i === currentIndex ? 'bg-blue-50 border-l-2 border-blue-500' : 'border-l-2 border-transparent'
              }`}
            >
              <span className="text-xs text-gray-400 font-mono w-6">{i + 1}</span>
              <span className="flex-1 truncate text-gray-600">{s.english_text}</span>
              {r && (
                <span className={`text-xs font-bold ${r.accuracy === 100 ? 'text-green-500' : r.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {r.accuracy.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
