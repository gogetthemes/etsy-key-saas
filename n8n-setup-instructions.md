# 🚀 Настройка n8n Workflow для Etsy Parser

## Шаг 1: Создание нового Workflow

1. Откройте n8n
2. Нажмите "Create new workflow"
3. Назовите: "Etsy Keyword Parser"

## Шаг 2: Добавление Webhook Trigger

1. Нажмите "+" для добавления узла
2. Найдите "Webhook"
3. Настройте:
   - **Method**: POST
   - **Path**: keyword-parser
   - **Response Mode**: Respond to Webhook

## Шаг 3: Добавление HTTP Request для Etsy

1. Нажмите "+" после Webhook
2. Найдите "HTTP Request"
3. Настройте:
   - **Method**: GET
   - **URL**: `https://www.etsy.com/search?q={{$json.keyword}}`
   - **Headers**: 
     ```
     User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
     ```

## Шаг 4: Добавление Code Node для обработки данных

1. Нажмите "+" после HTTP Request
2. Найдите "Code"
3. Вставьте код:
```javascript
// Простая обработка данных
const keyword = $('Webhook Trigger').all()[0].json.keyword;
const keywordId = $('Webhook Trigger').all()[0].json.keywordId;

// Тестовые данные (замените на реальный парсинг)
const suggestions = [
  keyword + " handmade",
  keyword + " vintage", 
  keyword + " unique",
  keyword + " custom",
  keyword + " personalized"
];

const relatedKeywords = [
  "handmade",
  "vintage", 
  "unique",
  "custom",
  "personalized"
];

return {
  keyword,
  keywordId,
  suggestions,
  relatedKeywords,
  listingCount: 1000,
  competition: 50
};
```

## Шаг 5: Добавление HTTP Request для обновления Backend

1. Нажмите "+" после Code
2. Найдите "HTTP Request"
3. Настройте:
   - **Method**: PUT
   - **URL**: `https://your-backend.onrender.com/api/keywords/{{$json.keywordId}}/update-data`
   - **Headers**:
     ```
     Content-Type: application/json
     ```
   - **Body**:
     ```json
     {
       "etsySuggestions": "={{$json.suggestions}}",
       "relatedKeywords": "={{$json.relatedKeywords}}",
       "listingCount": "={{$json.listingCount}}",
       "competition": "={{$json.competition}}"
     }
     ```

## Шаг 6: Добавление Response Node

1. Нажмите "+" после HTTP Request
2. Найдите "Respond to Webhook"
3. Настройте:
   - **Respond With**: JSON
   - **Response Body**:
     ```json
     {
       "success": true,
       "message": "Keyword processed successfully"
     }
     ```

## Шаг 7: Активация Workflow

1. Нажмите "Save"
2. Нажмите "Activate" (переключатель в правом верхнем углу)

## Шаг 8: Копирование Webhook URL

1. После активации скопируйте URL webhook
2. Он будет вида: `https://your-n8n-domain.com/webhook/keyword-parser`

## Шаг 9: Настройка Backend

В Render добавьте переменную окружения:
```
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/keyword-parser
```

## Шаг 10: Тестирование

1. Откройте: `https://your-backend.onrender.com/test-keywords.html`
2. Добавьте ключевое слово
3. Проверьте логи в n8n и backend

## 🔧 Альтернативный простой вариант

Если сложно - создайте только 3 узла:

1. **Webhook Trigger** (POST /keyword-parser)
2. **Code** (с тестовыми данными)
3. **HTTP Request** (PUT в backend)

Это минимальная рабочая версия для тестирования интеграции. 