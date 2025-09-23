# Техническое задание: Pricing страница для AI-сервиса Roomie

## Общее описание

Создать встраиваемый HTML/WordPress элемент для ценовой страницы AI-сервиса для отелей с возможностью выбора тарифных планов, переключением режимов биллинга и интерактивным калькулятором экономии.

## 1. Архитектура и технические требования

### 1.1 Технический стек
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Стилизация**: CSS Grid/Flexbox для layout, CSS переменные для темизации
- **Анимации**: CSS animations или легкая JS-библиотека (например, GSAP)
- **Иконки**: Lucide Icons или аналогичная SVG-библиотека
- **Многоязычность**: JSON-файлы с переводами + JS-функция переключения
- **Responsive**: Mobile-first подход

### 1.2 Структура файлов
```
roomie-pricing/
├── index.html
├── css/
│   ├── main.css
│   ├── pricing-cards.css
│   ├── calculator.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── pricing-logic.js
│   ├── calculator.js
│   └── language.js
├── data/
│   ├── translations.json
│   └── pricing-config.json
└── assets/
    └── icons/
```

## 2. Функциональные требования

### 2.1 Языковая локализация

**Поддерживаемые языки:**
- Украинский (по умолчанию)
- Русский  
- Английский

**Система переводов:**
```javascript
// Все тексты должны использовать функцию перевода:
function t(key) {
  return translations[currentLanguage][key] || key;
}

// Пример использования:
document.getElementById('title').textContent = t('hero_title');
```

**Переключатель языков:**
- Кнопка в правом верхнем углу
- Иконка глобуса + флаг текущего языка
- Цикличное переключение RU → UA → EN → RU
- Сохранение в localStorage

### 2.2 Режимы биллинга

**Три режима:**
1. **"За использование"** (usage) - показывает 2 карточки: PRO, PREMIUM
2. **"Ежемесячно"** (monthly) - показывает 3 карточки: BASIC, PRO, PREMIUM  
3. **"Ежегодно"** (yearly) - показывает 3 карточки с годовыми ценами

**UI переключателя:**
- Анимированный toggle для usage/monthly (горизонтальный)
- Отдельная кнопка для yearly (под основным toggle)
- При выборе yearly показывается "Экономия до 20%"

**Логика отображения карточек:**
```javascript
function updatePricingDisplay(billingMode) {
  const grid = document.getElementById('pricing-grid');
  
  if (billingMode === 'usage') {
    grid.className = 'pricing-grid grid-2-columns'; // 2 колонки
    hideCard('basic');
    showCard('pro');
    showCard('premium');
  } else {
    grid.className = 'pricing-grid grid-3-columns'; // 3 колонки
    showCard('basic');
    showCard('pro'); 
    showCard('premium');
  }
}
```

### 2.3 Ценовые планы

#### BASIC Plan
- **Только** для monthly/yearly режимов
- **Цена**: $99 (фиксированная для всех режимов)
- **Описание**: "Базовый план для начинающих"
- **Функции**:
  - ИИ помощь гостям
  - Автоматизированное управление бронированием  
  - Стандартная поддержка
  - Online chat
  - Интеграция с PMS

#### PRO Plan (MOST POPULAR)
- **Usage**: "5 центів =0.05$" per request
- **Monthly**: $299 (было $359)
- **Yearly**: $239 (было $299)
- **Описание**: "Идеально для растущих отелей"
- **Функции**: всё из BASIC +
  - Поддержка нескольких языков
  - Приоритетная поддержка
  - Персональный Telegram-бот (+ tooltip)
  - Удаление логотипа (+ tooltip)

#### PREMIUM Plan  
- **Usage**: "20 центів =0.20$" per request
- **Monthly**: $1,099
- **Yearly**: $879 (было $1,099)
- **Описание**: "Корпоративное решение"
- **Функции**: всё из PRO +
  - Расширенная аналитика
  - Персональное обучение ИИ
  - Персональный менеджер аккаунта
  - Индивидуальный дизайн виджета

### 2.4 Карточки тарифов

**Структура карточки:**
```html
<div class="pricing-card" data-plan="pro">
  <div class="popular-badge">MOST POPULAR</div>
  <div class="crown-icon">👑</div>
  
  <div class="plan-header">
    <h3 class="plan-title">PRO</h3>
    <p class="plan-description">Perfect for growing hotels</p>
  </div>
  
  <div class="pricing-display">
    <span class="original-price">$359</span>
    <span class="current-price">$299</span>
    <p class="billing-period">per month</p>
  </div>
  
  <div class="features-list">
    <!-- Список функций с галочками -->
  </div>
  
  <button class="subscribe-btn">Подписаться</button>
</div>
```

**Интерактивность:**
- Hover эффекты с поднятием карточки
- Анимация при переключении режимов
- PRO план помечен как "MOST POPULAR" с короной

### 2.5 Система расчёта цен

**Для usage-режима с аддонами:**
```javascript
function calculateUsagePrice(basePriceText, selectedAddons) {
  // Извлекаем базовую цену: "5 центів =0.05$" → 5
  const match = basePriceText.match(/(\d+(?:\.\d+)?)\s*цент(?:ов|ів)/);
  const basePrice = match ? parseFloat(match[1]) : 0;
  
  // Считаем аддоны: +0.5 центов за каждый
  const addonCost = selectedAddons.length * 0.5;
  const totalPrice = basePrice + addonCost;
  
  // Возвращаем в формате: "5.5 центів =0.055$"
  const dollarEquivalent = (totalPrice / 100).toFixed(3);
  const centWord = basePriceText.includes('центів') ? 'центів' : 'центов';
  return `${totalPrice} ${centWord} =${dollarEquivalent}$`;
}
```

## 3. Калькулятор экономии

### 3.1 Размещение и поведение

**Desktop**: 
- Липкая карточка справа от pricing планов
- Позиция: `position: sticky; top: 24px`
- Ширина: 350px

**Mobile**:
- Баннер под pricing планами
- При клике - полноэкранная модалка
- Swipe-to-close жестом вниз

### 3.2 Интерфейс калькулятора

**Поля ввода:**
```javascript
const calculatorFields = {
  dailyRequests: { default: 30, label: "Запросов в день" },
  adr: { default: 4000, label: "Средняя цена за номер (ADR)" },
  los: { default: 2, label: "Средняя длительность проживания" },
  otaCommission: { default: 12, label: "Комиссия OTA %" },
  processingCost: { default: 2.5, label: "Издержки прямого платежа %" },
  baseDirectShare: { default: 15, label: "Базовая доля прямых бронирований %" },
  directShareGrowth: { default: 20, label: "Прирост доли direct %" },
  conversionGrowth: { default: 0, label: "Прирост конверсии %" },
  currentBookingsPerMonth: { default: 0, label: "Текущие брони в месяц" },
  additionalServiceRevenuePerBooking: { default: 0, label: "Доп. доход с услуг на бронь" }
};
```

**Мультивалютность:**
- Переключатель UAH / USD / EUR
- Курсы валют: USD: 1.0, EUR: 0.85, UAH: 37.0
- Форматирование чисел по локали

### 3.3 Алгоритм расчёта экономии

```javascript
function calculateSavings(inputs) {
  const {
    dailyRequests, adr, los, otaCommission, processingCost,
    baseDirectShare, directShareGrowth, conversionGrowth,
    currentBookingsPerMonth, additionalServiceRevenuePerBooking,
    currency
  } = inputs;
  
  // Константы
  const currencyRates = { USD: 1.0, EUR: 0.85, UAH: 37.0 };
  const baseConversionRate = 35; // Фиксированная конверсия 35%
  const daysInPeriod = 30;
  const avgBookingRevenue = adr * los;
  
  // Базовые расчёты
  const B0 = dailyRequests * (baseConversionRate / 100); // Бронирования/день до Roomie
  const B1 = B0 * (1 + conversionGrowth / 100); // После Roomie
  const s0 = baseDirectShare / 100; // Базовая доля direct
  const s1 = Math.min(1, s0 * (1 + directShareGrowth / 100)); // Новая доля direct
  
  // 1. Экономия на комиссии (переток OTA → Direct)
  const directOnlyConv = B1 * s0;
  const direct1 = B1 * s1;
  const deltaDirectShift = Math.max(0, direct1 - directOnlyConv);
  const commissionSavings = deltaDirectShift * avgBookingRevenue * 
    (otaCommission - processingCost) / 100 * daysInPeriod;
  
  // 2. Дополнительная прибыль от прироста бронирований
  const deltaB = B1 - B0;
  const additionalDirectRevenue = deltaB * s1 * avgBookingRevenue * 
    (1 - processingCost / 100) * daysInPeriod;
  const additionalOtaRevenue = deltaB * (1 - s1) * avgBookingRevenue * 
    (1 - otaCommission / 100) * daysInPeriod;
  const additionalRevenueFromConversion = additionalDirectRevenue + additionalOtaRevenue;
  
  // 3. Стоимость невнимания к гостю
  const timeSavings = dailyRequests * 75 * currencyRates[currency];
  
  // 4. Дополнительный заработок (фиксированно 8% рост)
  const additionalBookingsPerMonth = currentBookingsPerMonth > 0 ? 
    Math.round(currentBookingsPerMonth * 0.08) : 0;
  const additionalRoomRevenue = additionalBookingsPerMonth * avgBookingRevenue;
  const additionalServiceRevenue = additionalBookingsPerMonth * additionalServiceRevenuePerBooking;
  const totalAdditionalEarnings = additionalRoomRevenue + additionalServiceRevenue;
  
  // Итоги
  const totalSavings = commissionSavings + additionalRevenueFromConversion + timeSavings;
  const totalEffect = totalSavings + totalAdditionalEarnings;
  
  return {
    commissionSavings,
    additionalRevenueFromConversion, 
    timeSavings,
    totalSavings,
    additionalBookingsPerMonth,
    additionalRoomRevenue,
    additionalServiceRevenue,
    totalAdditionalEarnings,
    totalEffect
  };
}
```

### 3.4 Persistence и sharing

**Автосохранение:**
```javascript
// Сохранять в localStorage при каждом изменении
function saveCalculation(inputs) {
  localStorage.setItem('roomie-calculator-data', JSON.stringify(inputs));
}

// Загружать при инициализации
function loadCalculation() {
  const saved = localStorage.getItem('roomie-calculator-data');
  return saved ? JSON.parse(saved) : getDefaultInputs();
}
```

**URL-шаринг:**
```javascript
function generateShareableUrl(inputs) {
  const params = new URLSearchParams();
  Object.entries(inputs).forEach(([key, value]) => {
    params.set(key, value.toString());
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  // Парсить и валидировать параметры
}
```

## 4. Дополнительные секции

### 4.1 Секция преимуществ
Аккордеон с 6 пунктами:
- Бесплатное подключение
- Никаких штрафов за отмену  
- Персональный менеджер
- Бесплатные обновления
- 24/7 поддержка
- Никаких скрытых платежей

### 4.2 FAQ секция
4 основных вопроса:
- Интеграция с существующими системами
- Варианты оплаты
- Безопасность данных  
- Сравнение планов

### 4.3 CTA и демо
- Кнопка "Попробовать демо" → https://roomie-bot-glebw2008.replit.app
- Кнопки "Подписаться" → https://t.me/hotelmindmanager

## 5. Стилизация и анимации

### 5.1 Цветовая схема
```css
:root {
  /* Primary Blue */
  --primary: hsl(220, 90%, 56%);
  --primary-foreground: hsl(0, 0%, 100%);
  
  /* Background */
  --background: hsl(0, 0%, 100%);
  --muted: hsl(220, 14%, 96%);
  --muted-foreground: hsl(220, 9%, 46%);
  
  /* Cards */
  --card: hsl(0, 0%, 100%);
  --card-foreground: hsl(220, 9%, 9%);
  --border: hsl(220, 13%, 91%);
  
  /* Accents */
  --accent: hsl(220, 14%, 96%);
  --accent-foreground: hsl(220, 9%, 9%);
}
```

### 5.2 Responsive breakpoints
```css
/* Mobile First */
.pricing-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-2-columns { grid-template-columns: repeat(2, 1fr); }
  .grid-3-columns { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .calculator-desktop { display: block; }
  .calculator-mobile { display: none; }
}
```

### 5.3 Анимации
- Плавные переходы при смене режимов биллинга (300ms ease)
- Hover эффекты для карточек (подъем на 4px)
- Анимированный toggle с spring-эффектом
- Fade-in анимации при загрузке

## 6. Интеграция и встраивание

### 6.1 WordPress Integration
```php
// functions.php
function enqueue_roomie_pricing() {
  wp_enqueue_script('roomie-pricing', get_template_directory_uri() . '/roomie-pricing/js/app.js', array(), '1.0.0', true);
  wp_enqueue_style('roomie-pricing', get_template_directory_uri() . '/roomie-pricing/css/main.css', array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'enqueue_roomie_pricing');

// Shortcode
function roomie_pricing_shortcode() {
  return '<div id="roomie-pricing-container"></div>';
}
add_shortcode('roomie_pricing', 'roomie_pricing_shortcode');
```

### 6.2 HTML Embed
```html
<!-- Простое встраивание -->
<div id="roomie-pricing"></div>
<script src="roomie-pricing/js/app.js"></script>
<link rel="stylesheet" href="roomie-pricing/css/main.css">
<script>
  RoomiePricing.init({
    container: '#roomie-pricing',
    language: 'ua', // по умолчанию
    currency: 'USD'
  });
</script>
```

## 7. Техническая документация

### 7.1 API интерфейс
```javascript
window.RoomiePricing = {
  init(options) {
    // Инициализация с настройками
  },
  
  setLanguage(language) {
    // Программная смена языка
  },
  
  setBillingMode(mode) {
    // Программная смена режима биллинга
  },
  
  getCalculatorData() {
    // Получить текущие данные калькулятора
  },
  
  setCalculatorData(data) {
    // Установить данные калькулятора
  }
};
```

### 7.2 События
```javascript
document.addEventListener('roomie:languageChanged', (e) => {
  console.log('Language changed to:', e.detail.language);
});

document.addEventListener('roomie:billingModeChanged', (e) => {
  console.log('Billing mode changed to:', e.detail.mode);
});

document.addEventListener('roomie:calculationUpdated', (e) => {
  console.log('Calculator result:', e.detail.result);
});
```

## 8. Тестирование

### 8.1 Функциональные тесты
- Переключение языков сохраняется в localStorage
- Переключение режимов биллинга корректно меняет отображение
- Калькулятор корректно считает экономию по формулам
- URL-параметры корректно загружаются в калькулятор
- Responsive поведение на всех устройствах

### 8.2 Совместимость
- Chrome 70+
- Firefox 65+  
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 70+

Этот документ содержит все необходимые детали для полной реализации функционала pricing страницы как встраиваемого HTML/WordPress элемента.