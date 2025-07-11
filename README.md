# Leo_bot — Тесты

Веб-приложение для прохождения психологических тестов, интегрированное с Telegram WebApp.

## Описание

Приложение содержит 5 психологических тестов:
1. 📘 **Тест на признаки созависимости** - Проверяет границы, тревожность, контроль. Для вкладки «Для близких».
2. 🔥 **Опросник эмоционального выгорания** - Усталость, деперсонализация, снижение эффективности. Подходит зависимым и близким.
3. 😟 **Тест на уровень тревожности** - Шкала Спилбергера: тревожность как состояние и как черта личности.
4. ❓ **Есть ли у вас зависимость?** - Базовая самодиагностика (адаптация AUDIT/DAST). Без указания вещества.
5. 🛡️ **Тест на устойчивость к стрессу** - Оценивает стрессоустойчивость, эмоциональную опору и факторы перегрузки.

## Технологии

- HTML5
- JavaScript (ES6+)
- Tailwind CSS
- Telegram WebApp API

## Структура проекта

- `index.html` - Основная HTML-структура приложения
- `app.js` - Логика работы приложения
- `data.js` - Данные тестов (вопросы и интерпретации результатов)

## Интеграция с Telegram

Приложение использует Telegram WebApp API для интеграции с ботом. Для корректной работы необходимо:

1. Разместить приложение на хостинге с поддержкой HTTPS
2. Настроить бота через BotFather, добавив WebApp URL
3. Убедиться, что скрипт `telegram-web-app.js` корректно загружается

## Локальный запуск

Для локального тестирования достаточно открыть `index.html` в браузере. Для полноценной работы с Telegram WebApp необходимо разместить приложение на HTTPS-хостинге.

## Цветовая схема

- Фон: Градиент от #CDE3FF через #DCCBFF к #B9A2FF
- Основной брендовый цвет: #D4C3FF
- Текст: #1F1F1F (тёмно-серый) или #5E4B8B (тёмно-фиолетовый)
- Карточки: белые с прозрачностью
- Кнопки: фон #D4C3FF, hover #CBB2FF, текст белый
