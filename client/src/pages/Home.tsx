import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mic, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          通过真实对话掌握英语
        </h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
          观看母语者真实对话，逐句精听练习，追踪你的每一点进步。
        </p>
        <Link
          to={user ? '/corpus' : '/register'}
          className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
        >
          {user ? '浏览学习素材' : '免费开始学习'}
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: BookOpen, title: '真实语料', desc: '来自真实生活场景的视频素材——咖啡店、面试、旅行等。' },
          { icon: Mic, title: '精准听写', desc: '仔细听，然后写下来。逐词对比评分，了解每个细节。' },
          { icon: TrendingUp, title: '追踪进步', desc: '查看正确率变化趋势，用详细数据见证自己的提高。' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <Icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">学习三部曲</h2>
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: '浏览', desc: '找到适合你水平和兴趣的学习内容。' },
            { step: '2', title: '学习', desc: '观看视频，逐句进行听写练习。' },
            { step: '3', title: '进步', desc: '积累词汇量，见证自己的成长轨迹。' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
