# Бронювання житла

Монорепо на TypeScript:
- apps/api — Node (Fastify), Postgres через Drizzle ORM
- apps/web — React
- packages/shared — спільні типи й робота з часом (`@shared/*`)
- apps/api/test/ — інтеграційні тести й стаби зовнішніх сервісів

Суми — у мінорних одиницях (копійки, центи). Дата й час заїзду зберігаються за місцевим часом об'єкта.

## Перевірка змін
Після змін у apps/api запускай npm run typecheck, npm run lint
і npm run test:unit. Інтеграційні тести — npm run test:integration
(потрібен запущений Docker).
