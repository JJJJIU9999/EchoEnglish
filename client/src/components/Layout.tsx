import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Headphones, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-700">
            <Headphones className="w-6 h-6" />
            EchoEnglish
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {loading ? null : user ? (
              <>
                <Link to="/corpus" className="text-gray-600 hover:text-blue-600">语料库</Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600">个人中心</Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-700">你好，{user.nickname}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">登录</Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
