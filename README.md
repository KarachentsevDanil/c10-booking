# Бронювання житла (кейс C10)

Навчальний репозиторій до кейсу C10 курсу (M2T1). Маркетплейс подобової оренди житла з об'єктами в кількох часових поясах. Оплата — через платіжного провайдера PayLink (вигаданий): гроші списуються при бронюванні, повернення робиться частковим refund на той самий платіж.

## Гілки

| Гілка | Що в ній |
|---|---|
| `main` | Стан до тікета BookingCancellation: політики flexible і strict |
| `final` | Після PR агента з кейсу: політика moderate, уточнені межі, подія `booking.cancelled` |
| `theory-2` | `final` + перевірки, які додає theory-2: хуки Claude Code, acceptance-тест, CODEOWNERS |

## Структура

```
apps/api            Fastify + Postgres (Drizzle ORM)
  src/cancellation  розрахунок повернення й сервіс скасування
  src/payments      клієнт PayLink
  src/webhooks      обробник вебхуків PayLink
  src/events        публікація подій (outbox) для сервісу нотифікацій
  test/integration  інтеграційні тести: сервіс + Postgres у Testcontainers
  test/stubs        стаби зовнішніх сервісів
apps/web            React (Vite)
packages/shared     спільні типи, робота з часом (@shared/*)
e2e                 Playwright
tools/paylink-sandbox  локальна заміна sandbox PayLink
ops/datadog         монітор і дашборд Datadog
```

## Запуск

Потрібні Node.js 22+ і Docker.

```bash
npm ci
npm run db:up          # Postgres у docker compose (порт: POSTGRES_PORT, за замовчуванням 5432)
npm run db:migrate
npm run db:seed
npm run dev:paylink    # sandbox PayLink на :4010
npm run dev:api        # API на :3000
npm run dev:web        # web на :5173
```

Якщо Postgres слухає не на 5432, задай `DATABASE_URL`, напр. `postgres://booking:booking@localhost:5433/booking`.

## Перевірки

| Шар | Команда | Де запускається |
|---|---|---|
| Типізація | `npm run typecheck` | локально; CI на кожен PR |
| Лінтер | `npm run lint` | локально; CI на кожен PR |
| Юніт | `npm run test:unit` | локально; CI на кожен PR |
| Інтеграційні | `npm run test:integration` (потрібен Docker) | CI на кожен PR; локально — за наявності Docker |
| e2e | `npm run test:e2e` | щоночі на staging; локально піднімає sandbox, api і web сам (Postgres — `npm run db:up`) |

Перед першим локальним e2e: `npx playwright install chromium`.

CI — `.github/workflows/pr.yml`. Branch protection для `main` (налаштовується в GitHub): обов'язкові перевірки `typecheck`, `lint`, `unit`, `integration` і 1 approve. Нічний e2e (`e2e-nightly.yml`) у гейт не входить.

Прод-моніторинг: Sentry (необроблені винятки API, вмикається змінною `SENTRY_DSN`), Datadog (`ops/datadog`).
