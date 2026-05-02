import 'dotenv/config';
import { query, run } from './db.js';

async function seed() {
  console.log('Seeding EchoEnglish database...');

  // ── Corpus 1: Ordering at a Cafe ──
  const { insertId: cafeId } = await run(
    `INSERT INTO corpus (title, description, scenario, difficulty, video_url, thumbnail_url, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'Ordering at a Cafe',
      'A typical conversation between a barista and a customer at a coffee shop. Learn how to order drinks, ask about menu items, and make small talk.',
      'daily', 1,
      '/videos/cafe.mp4',
      '/thumbnails/cafe.jpg',
      68,
    ]
  );

  const cafeSentences = [
    [1, 0.000, 3.200, "Good morning! Welcome to Brew & Bean. What can I get for you today?", "早上好！欢迎来到 Brew & Bean。今天要喝点什么？"],
    [2, 3.500, 7.800, "Hi there! I'd like a medium latte, please.", "你好！我想要一杯中杯拿铁，谢谢。"],
    [3, 8.100, 11.500, "Sure! Would you like that hot or iced?", "好的！您要热的还是冰的？"],
    [4, 11.800, 14.200, "Hot, please. It's a bit chilly outside.", "热的，谢谢。外面有点冷。"],
    [5, 15.000, 19.000, "Great choice. Can I get a name for the order?", "好选择。请问您的名字是？"],
    [6, 19.500, 22.300, "It's Sarah. S-A-R-A-H.", "我叫 Sarah，S-A-R-A-H。"],
    [7, 23.000, 27.500, "Perfect. That'll be four fifty. Cash or card?", "好的，一共四块五。现金还是刷卡？"],
    [8, 28.000, 31.000, "Card, please. Here you go.", "刷卡。给你。"],
  ];

  for (const [index, start, end, eng, chn] of cafeSentences) {
    await run(
      `INSERT INTO sentences (corpus_id, sentence_index, start_time, end_time, english_text, chinese_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cafeId, index, start, end, eng, chn]
    );
  }
  console.log(`  Inserted corpus #${cafeId}: Ordering at a Cafe (${cafeSentences.length} sentences)`);

  // ── Corpus 2: Job Interview Basics ──
  const { insertId: interviewId } = await run(
    `INSERT INTO corpus (title, description, scenario, difficulty, video_url, thumbnail_url, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'Job Interview Basics',
      'A mock job interview covering common questions about experience, strengths, and career goals. Great for intermediate learners preparing for English interviews.',
      'business', 3,
      '/videos/interview.mp4',
      '/thumbnails/interview.jpg',
      105,
    ]
  );

  const interviewSentences = [
    [1, 0.000, 4.500, "Thank you for coming in today. Could you start by telling me a little about yourself?", "感谢你今天来面试。能先简单介绍一下你自己吗？"],
    [2, 5.000, 10.200, "Of course. I graduated with a degree in marketing and I've been working in digital advertising for the past three years.", "当然。我毕业于市场营销专业，过去三年一直在做数字广告。"],
    [3, 10.500, 14.800, "That's impressive. What would you say is your greatest professional strength?", "很不错。你认为你最大的职业优势是什么？"],
    [4, 15.200, 19.500, "I'd say it's my ability to analyze data and turn insights into actionable strategies.", "我觉得是我分析数据并将洞察转化为可执行策略的能力。"],
    [5, 20.000, 24.000, "Can you give me a specific example of that?", "能给我一个具体的例子吗？"],
    [6, 24.500, 29.800, "Sure. At my last job, I analyzed customer feedback data and identified a trend that led to a fifteen percent increase in retention.", "当然。在我上一份工作中，我分析了客户反馈数据，发现了一个趋势，最终使客户留存率提高了15%。"],
    [7, 30.200, 34.000, "That's exactly the kind of initiative we value here.", "这正是我们公司看重的主观能动性。"],
    [8, 34.500, 38.800, "What do you know about our company and why do you want to work here?", "你对我们公司了解多少？为什么想来这里工作？"],
    [9, 39.200, 44.500, "I've followed your company's growth in the e-commerce space and I admire your commitment to user experience.", "我一直关注贵公司在电商领域的发展，也很钦佩你们对用户体验的执着。"],
    [10, 45.000, 50.000, "I believe my background in data-driven marketing would be a great fit for your team.", "我相信我在数据驱动营销方面的背景会很适合你们的团队。"],
  ];

  for (const [index, start, end, eng, chn] of interviewSentences) {
    await run(
      `INSERT INTO sentences (corpus_id, sentence_index, start_time, end_time, english_text, chinese_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [interviewId, index, start, end, eng, chn]
    );
  }
  console.log(`  Inserted corpus #${interviewId}: Job Interview Basics (${interviewSentences.length} sentences)`);

  // ── Corpus 3: Asking for Directions ──
  const { insertId: directionsId } = await run(
    `INSERT INTO corpus (title, description, scenario, difficulty, video_url, thumbnail_url, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'Asking for Directions',
      'A conversation between a tourist and a local about finding a museum, buying a subway ticket, and getting around the city.',
      'travel', 2,
      '/videos/directions.mp4',
      '/thumbnails/directions.jpg',
      82,
    ]
  );

  const directionsSentences = [
    [1, 0.000, 3.800, "Excuse me, could you tell me how to get to the Natural History Museum?", "打扰一下，请问自然历史博物馆怎么走？"],
    [2, 4.200, 8.500, "Of course! It's about a fifteen-minute walk from here. Just go straight down this street for three blocks.", "当然！从这里步行大约十五分钟。沿着这条街直走三个街区。"],
    [3, 8.800, 12.000, "Then take a left at the big intersection with the fountain.", "然后在有大喷泉的那个大路口左转。"],
    [4, 12.500, 15.200, "You'll see the museum on your right. You can't miss it.", "你会看到博物馆就在右边，不会错过的。"],
    [5, 15.800, 19.000, "Thank you so much! Also, where's the nearest subway station?", "太感谢了！还有，最近的地铁站在哪？"],
    [6, 19.500, 23.500, "There's one right around the corner. Go back one block and turn right.", "拐角就有一个。往回走一个街区然后右转。"],
    [7, 24.000, 27.800, "You'll need to buy a day pass if you're planning to use the subway a lot.", "如果你打算多坐地铁的话，买一张日票会比较划算。"],
    [8, 28.200, 31.500, "Good idea. How much does a day pass cost?", "好主意。日票多少钱？"],
    [9, 32.000, 36.000, "It's twelve dollars and it covers all lines within the city center.", "十二美元，可以在市中心所有线路使用。"],
  ];

  for (const [index, start, end, eng, chn] of directionsSentences) {
    await run(
      `INSERT INTO sentences (corpus_id, sentence_index, start_time, end_time, english_text, chinese_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [directionsId, index, start, end, eng, chn]
    );
  }
  console.log(`  Inserted corpus #${directionsId}: Asking for Directions (${directionsSentences.length} sentences)`);

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
