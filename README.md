# Simulacrum — Документация (на русском)

Краткое описание
- Проект: простой фронтенд-симулятор автономных агентов, написанный на React + TypeScript и собираемый с помощью Vite.
- Цель: демонстрация взаимодействия множества агентов с моделями LLM (поддерживаются Ollama, OpenAI, Google Gemini) и визуализация их отношений.

Краткая структура проекта
- Файлы сборки и запуска: [package.json](package.json)
- Точка входа: [index.tsx](index.tsx), основное приложение: [App.tsx](App.tsx)
- Константы и типы: [constants.ts](constants.ts), [types.ts](types.ts)
- Компоненты UI: [components/](components/)
- Сервисы LLM: [services/ollamaService.ts](services/ollamaService.ts), [services/openaiService.ts](services/openaiService.ts), [services/geminiService.ts](services/geminiService.ts)

Как это работает (коротко)
- Интерфейс хранит список агентов (`Agent`) и логи (`LogEntry`). Главный цикл в `App.tsx` делает тики (интервалы) и по очереди вызывает генерацию действия для случайного свободного агента.
- Генерация действия выполняется через экспортированные функции `generateAgentAction` в папке `services/`. Каждая реализация (Ollama / OpenAI / Gemini) формирует системный промпт, вызывает API и парсит JSON-ответ в `AgentActionResponse`.
- После получения решения приложение обновляет состояние агента, добавляет лог и корректирует взаимоотношения (affinity).

Быстрый старт (локально)
1. Убедитесь, что установлен Node.js (рекомендуется Node 18+).
2. Установите зависимости:

```bash
npm install
```

3. Запустить в режиме разработки:

```bash
npm run dev
```

4. Построить production-версию:

```bash
npm run build
```

5. Просмотреть собранную версию локально:

```bash
npm run preview
```

Скрипты (из `package.json`)
- `dev` — запускает Vite в режиме разработки.
- `build` — собирает статические артефакты в `dist/`.
- `preview` — локально служит собранный билд.

Переменные окружения и интеграции LLM
- `VITE_OLLAMA_BASE_URL` — базовый URL Ollama API (по умолчанию `http://localhost:11434/` в коде).
- `VITE_OLLAMA_MODEL` — модель Ollama по умолчанию (в коде: `qwen3:4b`).
- `VITE_OPENAI_API_KEY` — API-ключ OpenAI для `openaiService.ts` (код также пытается читать `process.env.OPENAI_API_KEY` или `API_KEY`).
- `VITE_GOOGLE_API_KEY` — API-ключ для Google Gemini (в `geminiService.ts` код также читает `GEMINI_API_KEY` или `API_KEY`).

Пример `.env` (локально для разработки с Vite):

```env
VITE_OLLAMA_BASE_URL=http://localhost:11434/
VITE_OLLAMA_MODEL=qwen3:4b
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_GOOGLE_API_KEY=your_google_key_here
```

Важно по безопасности
- `openaiService.ts` выполняет вызовы напрямую из браузера, что раскрывает ключ пользователю — это НЕ безопасно для продакшена. Рекомендуется проксировать LLM‑запросы через сервер (backend), который хранит ключи и реализует ограничения/кэширование/аутентификацию.

Особенности реализации
- Ollama: `services/ollamaService.ts` ожидает OpenAI-подобный endpoint `/chat/completions` и поддерживает `response_format: { type: "json_object" }`. По умолчанию использует `http://localhost:11434/` и модель `qwen3:4b`.
- OpenAI: `services/openaiService.ts` вызывает `https://api.openai.com/v1/chat/completions` с моделью `gpt-4o-mini` (в коде) и ожидает JSON-ответ; при отсутствии ключа используется локальный fallback-ответ.
- Gemini: `services/geminiService.ts` использует пакет `@google/genai` и настраивает response schema, возвращая JSON.

Развёртывание (рекомендации)
- Статический фронтенд: соберите `npm run build` и хостите содержимое `dist/` на любом статическом хостинге (Vercel, Netlify, GitHub Pages, CDN).
- Для безопасного использования OpenAI/Gemini/Ollama в продакшене:
  - Разверните небольшой backend (Express / Fastify / Next.js API / Cloud Function), который принимает запросы от фронтенда и перенаправляет их к LLM, добавляет аутентификацию и лимиты.
  - Backend можно упаковать в Docker-контейнер и деплоить в облако (AWS ECS/Fargate, GKE, DigitalOcean App Platform).

Пример минимальной схемы продакшен-пайплайна
- Клиент (статический) ↔ HTTPS ↔ Backend proxy ↔ LLM (OpenAI / Google / локальный Ollama). Backend реализует кэширование, batching, rate-limiting.

Команды деплоя (пример для Docker + статического хостинга)

```bash
# Сборка фронтенда
npm run build

# Залить папку dist/ на выбранный статический хост
# либо собрать Docker-образ с сервером, который отдает dist/ и проксирует LLM
```

План масштабирования и дальнейшего развития
1. Безопасность и прокси для LLM
   - Вынести вызовы к OpenAI/Gemini в серверную часть.
   - Реализовать аутентификацию и quota для клиентов.

2. Worker/Queue архитектура
   - Переход от синхронных fetch-ов в UI к очереди задач (RabbitMQ / Redis Streams / SQS).
   - Пулы воркеров, которые обрабатывают запросы к LLM (параллелизация + контроль concurrency).

3. Кэширование и батчинг
   - Кэшировать результаты типовых prompt-ов (Redis) и объединять похожие запросы, чтобы снизить стоимость.

4. Хранение состояния и долговременная память
   - Перенести `memories` и `relationships` в БД (Postgres / MongoDB) для консистентности, отката и аналитики.

5. Реальное время и масштабирование UI
   - Использовать WebSocket/Server-Sent Events для пуш-обновлений состояния агентов.
   - Горизонтальное масштабирование backend-а и базы данных; использовать индексирование и шардирование при росте объёма.

6. Наблюдаемость и мониторинг
   - Метрики (Prometheus), логирование (ELK/Cloud Logging), алерты по ошибкам LLM и latency.

7. Распределение нагрузки по моделям
   - Маршрутизация чувствительных/дорогих запросов на сильные модели, а рутинных — на дешёвые/локальные.

8. Контроль затрат и политик
   - Budget-aware routing, throttling, пер-юзер квоты, retention политики логов и памяти.

9. Тестирование и CI/CD
   - E2E-тесты симуляции, unit-тесты для сервисов и промптов, CI пайплайн для сборки и деплоя.

Планы по расширению кода
- Добавление нового провайдера LLM: создать новый файл в `services/`, экспортировать `generateAgentAction` по аналогии с существующими и подключить его в коде (в `App.tsx` или через фабрику сервисов).
- Персистентность: создать API-эндпоинты для сохранения/загрузки состояния агентов и подключить базу данных.

Где смотреть исходники
- UI и логика симуляции: [App.tsx](App.tsx)
- Модели и промпты: `services/ollamaService.ts`, `services/openaiService.ts`, `services/geminiService.ts`
- Инициализация агентов: [constants.ts](constants.ts)
- Типы и контракты: [types.ts](types.ts)


