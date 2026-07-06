# Coding Tutor — دستیار آموزشی برنامه‌نویسی

یک دستیار هوشمند برای یادگیری برنامه‌نویسی با Next.js، Vercel AI SDK و LangChain.

## قابلیت‌ها

| ابزار | توضیح | نمونه |
|-------|--------|-------|
| **Quiz Generator** | تولید کوییز آموزشی | `Generate a quiz about React Context API` |
| **Code Generator** | تولید کد و مثال آموزشی | `Generate a FastAPI CRUD example` |
| **GitHub Review** | بررسی پروژه GitHub | `Review this repository: https://github.com/user/repo` |
| **Learning Roadmap** | مسیر یادگیری شخصی‌سازی‌شده | `Create a roadmap for becoming a Backend Developer` |
| **YouTube Search** ⭐ | پیدا کردن ویدئوهای آموزشی | `Find videos for FastAPI Authentication` |
| **Context7 Docs** ⭐ | مستندات به‌روز تکنولوژی‌ها | `Latest documentation for LangChain` |

## Middleware ها

- **Student Level** — تنظیم پاسخ بر اساس سطح (مبتدی / متوسط / پیشرفته)
- **Conversation Summary** — خلاصه‌سازی مکالمات طولانی با LangChain
- **Context Management** — ذخیره سطح، تکنولوژی‌ها، مسیر یادگیری و موضوعات

## راه‌اندازی

### ۱. نصب

```bash
cd coding-tutor
npm install
```

### ۲. تنظیم API (متیس)

```bash
cp .env.example .env.local
```

فایل `.env.local` را باز کن و کلید API متیس را وارد کن:

```env
OPENAI_API_KEY=your-metis-api-key
OPENAI_API_BASE=https://api.metisai.ir/api/v1/wrapper/openai_chat_completion
OPENAI_MODEL=gpt-4o-mini
```

کلید API را از [console.metisai.ir](https://console.metisai.ir) بگیر.

### ۳. اجرا

```bash
npm run dev
```

مرورگر را باز کن: [http://localhost:3000](http://localhost:3000)

## متغیرهای محیطی (اختیاری)

| متغیر | توضیح |
|-------|--------|
| `GITHUB_TOKEN` | توکن GitHub برای rate limit بالاتر |
| `YOUTUBE_API_KEY` | کلید YouTube Data API v3 |
| `CONTEXT7_API_KEY` | کلید Context7 برای مستندات |

## ساختار پروژه

```
src/
├── app/
│   ├── api/chat/route.ts      # Agent + Tools + Middleware
│   ├── api/context/route.ts   # مدیریت Context کاربر
│   └── page.tsx
├── components/
│   ├── chat/                  # UI چت
│   └── sidebar/               # تنظیمات سطح
├── lib/
│   ├── ai/model.ts            # پیکربندی Metis/OpenAI
│   ├── tools/                 # 6 ابزار Agent
│   ├── middleware/            # 3 Middleware
│   └── context/store.ts       # ذخیره Context
└── types/
```

## تکنولوژی‌ها

- **Next.js 16** — App Router
- **Vercel AI SDK** — Streaming Chat + Tools
- **LangChain** — Summarization Chain
- **Octokit** — GitHub API
- **Tailwind CSS** — UI
- **Metis API** — مدل زبانی (OpenAI-compatible)

## ارزیابی

| بخش | امتیاز | وضعیت |
|------|--------|--------|
| Agent | 20 | ✅ |
| Quiz Generator | 10 | ✅ |
| Code Generator | 10 | ✅ |
| GitHub Review | 15 | ✅ |
| Learning Roadmap | 10 | ✅ |
| Student Level Middleware | 10 | ✅ |
| Context & Conversation | 15 | ✅ |
| کیفیت کد | 5 | ✅ |
| مستندسازی | 5 | ✅ |
| YouTube Search (+5) | ⭐ | ✅ |
| Context7 (+5) | ⭐ | ✅ |
| UI حرفه‌ای (+10) | ⭐ | ✅ |

## لایسنس

MIT
