// Tooltip content mapping based on the attached images
const tooltipContent = {
    'optimal-tariff': 'Оптимальный тариф для тестирования',
    'testing-features': `
        <ul>
            <li>Неограниченное количество тем для часто задаваемых вопросов</li>
            <li>Анализ настроений и расстановка приоритетов</li>
            <li>Возможности самообучения</li>
        </ul>
    `,
    'personal-manager': `
        <ul>
            <li>Персональный менеджер</li>
            <li>Персонализированная тренировка</li>
        </ul>
    `,
    'booking-integration': 'Интеграция с системой бронирования',
    'channels': `
        <ul>
            <li>Сайт</li>
            <li>Персональный веб-чат виджет</li>
            <li>Telegram</li>
        </ul>
    `,
    'whatsapp-companies': `
        <ul>
            <li>Рекламные компании WhatsApp</li>
            <li>Продвижение программы лояльности</li>
        </ul>
    `,
    'extended-scenarios': `
        <ul>
            <li>Функция решения разнообразных проблемных ситуаций с помощью бота, включая смену полотенец, жалобы на температуру в номере, заказ еды и другие услуги</li>
            <li>Кампании дополнительных и перекрестных продаж</li>
            <li>Кампании по отзывам гостей</li>
            <li>Опросы удовлетворенности</li>
        </ul>
    `,
    'automated-mailings': `
        <p><strong>С:</strong></p>
        <ul>
            <li>приветствием,</li>
            <li>подсказками по заезду,</li>
            <li>вечерними мероприятиями,</li>
            <li>специальными предложениями</li>
        </ul>
    `,
    'integrations': 'Интеграция с PMS и/или CRM',
    'channels-premium': `
        <ul>
            <li>Сайт</li>
            <li>Соцсети</li>
            <li>Telegram</li>
            <li>WhatsApp</li>
        </ul>
    `
};

class TooltipManager {
    constructor() {
        this.tooltip = document.getElementById('tooltip');
        this.tooltipContent = this.tooltip.querySelector('.tooltip-content');
        this.currentTooltip = null;
        this.isVisible = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Показ тултипа при наведении
        document.addEventListener('mouseenter', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) this.showTooltip(element);
        }, true);

        // Скрытие тултипа при уходе
        document.addEventListener('mouseleave', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) this.hideTooltip();
        }, true);
    }
    
    showTooltip(element) {
        const key = element.getAttribute('data-tooltip');
        const content = tooltipContent[key];
        if (!content) return;

        this.currentTooltip = element;
        this.tooltipContent.innerHTML = content;
        this.tooltip.classList.add('show');
        this.isVisible = true;

        // Позиционируем над элементом
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const top = window.scrollY + rect.top - tooltipRect.height - 10; // 10px отступ сверху
        const left = window.scrollX + rect.left + (rect.width - tooltipRect.width) / 2; // по центру

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${Math.max(10, left)}px`; // не уходим за левый край
    }
    
    hideTooltip() {
        this.tooltip.classList.remove('show');
        this.isVisible = false;
        this.currentTooltip = null;

        setTimeout(() => {
            if (!this.isVisible) this.tooltipContent.innerHTML = '';
        }, 300);
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new TooltipManager();
});

// Animation for cards on page load
class CardAnimations {
    constructor() {
        this.initAnimations();
    }
    
    initAnimations() {
        // Observe cards for entry animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Initially hide cards and observe them
        const cards = document.querySelectorAll('.pricing-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = `all 0.6s ease ${index * 0.2}s`;
            observer.observe(card);
        });
    }
}

// Enhanced hover effects
class HoverEffects {
    constructor() {
        this.initHoverEffects();
    }
    
    initHoverEffects() {
        const cards = document.querySelectorAll('.pricing-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Feature item hover effects
        const featureItems = document.querySelectorAll('.feature-item, .feature-group');
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (!item.hasAttribute('data-tooltip')) {
                    item.style.transform = 'translateX(5px)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (!item.hasAttribute('data-tooltip')) {
                    item.style.transform = 'translateX(0)';
                }
            });
        });
    }
}

// Smooth scrolling and page interactions
class PageInteractions {
    constructor() {
        this.initSmoothScrolling();
        this.initParallaxEffect();
    }
    
    initSmoothScrolling() {
        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    initParallaxEffect() {
        // Simple parallax effect for header
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.header');
            if (header) {
                header.style.transform = `translateY(${scrolled * 0.2}px)`;
                header.style.opacity = `${1 - scrolled / 500}`;
            }
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TooltipManager();
    new CardAnimations();
    new HoverEffects();
    new PageInteractions();
    
    console.log('AI Pricing Page Initialized Successfully!');
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // Hide tooltip on resize to prevent positioning issues
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
});

// Prevent context menu on images for better UX
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

function matchCardHeightsToSmallest() {
    const cards = document.querySelectorAll('.pricing-card');

    let heights = Array.from(cards).map(card => card.offsetHeight);

    const minHeight = Math.min(...heights);

    cards.forEach(card => {
        card.style.height = minHeight + 'px';
        card.style.overflow = 'hidden'; // обрезка лишнего снизу
    });
}

window.addEventListener('load', matchCardHeightsToSmallest);

window.addEventListener('resize', matchCardHeightsToSmallest);
