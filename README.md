# Dashboard: реализация под Mail Manager Single Admin

Dashboard находится в `src/pages/Dashboard/index.tsx` и состоит из компонентов в
`src/features/dashboard/components`. Вся бизнес-логика запросов, автообновления,
ручной синхронизации и расчёта показателей вынесена в `features/dashboard`.

## Используемые backend endpoints

Все запросы идут через существующий Axios-клиент `/api` с cookie-refresh и CSRF.

- `GET /api/queue/stats` — количество заданий по статусам за всё время (только активные письма).
- `GET /api/reports/daily?date=YYYY-MM-DD` — количество писем за календарный день **UTC**.
- `GET /api/classifications?limit=5` — последние классификации.
- `GET /api/classifications?limit=5&importance=high` — важные письма.
- `GET /api/queue/problems?limit=5` — письма, требующие внимания.
- `GET /api/mail/settings` — признак того, что IMAP настроен; секреты сервер не возвращает.
- `POST /api/mail/sync` — **только вручную по кнопке**; сканирование IMAP, не выполнение классификации в синхронном HTTP-ответе.

## Как обновляются данные

- Zustand хранит результаты запросов, статус загрузки и данные последних успешных ответов.
- `useDashboard` запускает загрузку при открытии страницы.
- Каждые 30 секунд (когда вкладка активна) выполняется фоновое обновление.
- При возврате на вкладку выполняется дополнительное обновление.
- При ошибке отдельного endpoint остальные секции продолжают работать; возможно отображение ранее загруженных данных.
- При смене/сбросе авторизации Zustand очищает почтовые данные, а завершившиеся позднее запросы игнорируются.
- Параллельные обновления одной страницы объединяются в один запрос на каждый endpoint.

## Структура

```
src/
  pages/Dashboard/index.tsx
  features/dashboard/
    api/dashboard.api.ts
    model/types.ts
    model/selectors.ts
    store/dashboard.store.ts
    hooks/useDashboard.ts
    components/
      DashboardHeader.tsx
      MetricCards.tsx
      QueueOverview.tsx
      TodayOverview.tsx
      ImportantList.tsx
      ProblemsList.tsx
      RecentList.tsx
      PanelState.tsx
```

## Проверка локально

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Сервер Go должен работать на `127.0.0.1:3000`, а браузер открывать
`http://localhost:5173` (запросы идут через Vite proxy).

В этой среде установить зависимости не удалось из-за отсутствия доступа к npm registry.
Выполнена синтаксическая проверка TS/TSX через TypeScript и отдельная проверка
чистых вычислений показателей. Полный `npm run build` нужно выполнить локально.

## Примечания

- Dashboard показывает только имеющиеся backend-показатели; он не придумывает метрики скорости LLM, доступности IMAP или количество _всех_ писем из почтового ящика.
- Данные `needs_review` на карточке относятся к текущему дню, а список проблем ограничен пятью записями.
- Для длительного `POST /api/mail/sync` задан индивидуальный таймаут Axios 245 секунд, потому что Go может сканировать IMAP до 4 минут.
- Dashboard ничего не удаляет и не предоставляет действий модели над почтой.
