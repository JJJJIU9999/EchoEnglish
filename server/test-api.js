/**
 * EchoEnglish API 自动化测试脚本
 * 用法：先启动服务器（npm run dev），再开一个新终端运行 `node test-api.js`
 */

const BASE = 'http://localhost:3001/api';

let token = '';
let vocabId = 0;
let passed = 0;
let failed = 0;

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function test(name, fn) {
  return fn()
    .then(() => { passed++; console.log(`  ✅ ${name}`); })
    .catch((err) => { failed++; console.log(`  ❌ ${name} — ${err.message}`); });
}

async function main() {
  console.log('EchoEnglish API 测试\n');

  // ── 健康检查 ──
  await test('GET /api/health 返回成功', async () => {
    const { status, data } = await request('GET', '/health');
    if (status !== 200 || !data.success) throw new Error('健康检查失败');
  });

  // ── 注册 ──
  const testEmail = `test-${Date.now()}@example.com`;

  await test('POST /api/auth/register 注册成功', async () => {
    const { status, data } = await request('POST', '/auth/register', {
      email: testEmail,
      password: '123456',
      nickname: 'Tester',
    });
    if (status !== 201 || !data.success) throw new Error(data.message || '注册失败');
    if (!data.data.token) throw new Error('缺少 token');
    token = data.data.token;
  });

  await test('POST /api/auth/register 重复邮箱返回409', async () => {
    const { status } = await request('POST', '/auth/register', {
      email: testEmail,
      password: '123456',
      nickname: 'Tester2',
    });
    if (status !== 409) throw new Error(`期望409，实际${status}`);
  });

  // ── 登录 ──
  await test('POST /api/auth/login 登录成功', async () => {
    const { status, data } = await request('POST', '/auth/login', {
      email: testEmail,
      password: '123456',
    });
    if (status !== 200 || !data.success) throw new Error(data.message || '登录失败');
    token = data.data.token;
  });

  await test('POST /api/auth/login 错误密码返回401', async () => {
    const { status } = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'wrongpassword',
    });
    if (status !== 401) throw new Error(`期望401，实际${status}`);
  });

  // ── 获取当前用户 ──
  await test('GET /api/auth/me 返回用户信息', async () => {
    const { status, data } = await request('GET', '/auth/me');
    if (status !== 200 || !data.data.user) throw new Error('获取用户信息失败');
    if (data.data.user.email !== testEmail) throw new Error('邮箱不匹配');
  });

  // ── 语料库 ──
  await test('GET /api/corpus 返回语料列表', async () => {
    const { status, data } = await request('GET', '/corpus');
    if (status !== 200 || !data.data.list) throw new Error('语料列表获取失败');
    if (data.data.list.length < 3) throw new Error(`期望至少3条，实际${data.data.list.length}条`);
    if (data.data.total !== 3) throw new Error(`期望total=3，实际${data.data.total}`);
  });

  await test('GET /api/corpus?scenario=daily 场景筛选', async () => {
    const { status, data } = await request('GET', '/corpus?scenario=daily');
    if (status !== 200) throw new Error('筛选失败');
    if (data.data.list.every((c) => c.scenario !== 'daily')) throw new Error('筛选结果包含非daily场景');
  });

  await test('GET /api/corpus?difficulty=1 难度筛选', async () => {
    const { status, data } = await request('GET', '/corpus?difficulty=1');
    if (status !== 200) throw new Error('筛选失败');
    if (data.data.list.every((c) => c.difficulty !== 1)) throw new Error('筛选结果包含非难度1');
  });

  await test('GET /api/corpus/1 返回语料详情+句子', async () => {
    const { status, data } = await request('GET', '/corpus/1');
    if (status !== 200) throw new Error('语料详情获取失败');
    if (!data.data.corpus) throw new Error('缺少corpus');
    if (!Array.isArray(data.data.sentences)) throw new Error('缺少sentences数组');
    if (data.data.sentences.length === 0) throw new Error('句子列表为空');
  });

  await test('GET /api/corpus/999 不存在的语料返回404', async () => {
    const { status } = await request('GET', '/corpus/999');
    if (status !== 404) throw new Error(`期望404，实际${status}`);
  });

  // ── 学习记录 ──
  await test('POST /api/learning/records 创建学习记录', async () => {
    const { status, data } = await request('POST', '/learning/records', {
      corpus_id: 1,
      total_sentences: 8,
      correct_sentences: 6,
      accuracy: 85.5,
      duration_seconds: 300,
    });
    if (status !== 201 || !data.data.record) throw new Error('创建记录失败');
    if (Number(data.data.record.accuracy) !== 85.5) throw new Error('正确率不匹配');
  });

  await test('GET /api/learning/records 获取学习记录列表', async () => {
    const { status, data } = await request('GET', '/learning/records');
    if (status !== 200) throw new Error('获取记录失败');
    if (data.data.list.length === 0) throw new Error('记录列表为空');
    if (!data.data.list[0].corpus_title) throw new Error('缺少corpus_title字段');
  });

  await test('GET /api/learning/stats 获取学习统计', async () => {
    const { status, data } = await request('GET', '/learning/stats');
    if (status !== 200) throw new Error('获取统计失败');
    if (Number(data.data.total_sessions) < 1) throw new Error('学习次数不正确');
  });

  // ── 无认证请求应返回401 ──
  await test('无 token 访问受保护接口返回401', async () => {
    const saved = token;
    token = '';
    const { status } = await request('GET', '/learning/records');
    token = saved;
    if (status !== 401) throw new Error(`期望401，实际${status}`);
  });

  // ── 生词本 ──
  await test('POST /api/vocabulary 添加生词', async () => {
    const { status, data } = await request('POST', '/vocabulary', {
      word: 'intersection',
      definition: '十字路口',
      sentence_id: 3,
    });
    if (status !== 201) throw new Error(data.message || '添加生词失败');
    vocabId = data.data.vocabulary.id;
  });

  await test('POST /api/vocabulary 重复单词返回409', async () => {
    const { status } = await request('POST', '/vocabulary', {
      word: 'intersection',
      definition: '重复了',
    });
    if (status !== 409) throw new Error(`期望409，实际${status}`);
  });

  await test('GET /api/vocabulary 获取生词列表', async () => {
    const { status, data } = await request('GET', '/vocabulary');
    if (status !== 200) throw new Error('获取失败');
    if (data.data.list.length === 0) throw new Error('列表为空');
  });

  await test('PATCH /api/vocabulary/:id 更新掌握度', async () => {
    const { status, data } = await request('PATCH', `/vocabulary/${vocabId}`, {
      mastery_level: 2,
    });
    if (status !== 200) throw new Error('更新失败');
    if (data.data.vocabulary.mastery_level !== 2) throw new Error('掌握度未更新');
  });

  await test('DELETE /api/vocabulary/:id 删除生词', async () => {
    const { status } = await request('DELETE', `/vocabulary/${vocabId}`);
    if (status !== 200) throw new Error('删除失败');
  });

  await test('GET /api/vocabulary 删除后列表为空', async () => {
    const { status, data } = await request('GET', '/vocabulary');
    if (status !== 200) throw new Error('获取失败');
    if (data.data.list.length !== 0) throw new Error(`期望0条，实际${data.data.list.length}条`);
  });

  // ── 结果 ──
  console.log(`\n${'='.repeat(40)}`);
  console.log(`通过: ${passed}  |  失败: ${failed}  |  总计: ${passed + failed}`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('测试运行异常:', err.message);
  process.exit(1);
});
