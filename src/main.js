// src/main.js – единый файл для всего сайта

// Telegram Bot settings
const TELEGRAM_TOKEN = '8736967035:AAEUXZ-UjVJ4IAOg4qTfnYXhLm0y-rKJ95c';
const TELEGRAM_CHAT_ID = '5773662616';

async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
        }),
    });
    if (!response.ok) {
        throw new Error('Ошибка отправки в Telegram');
    }
    return await response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('ЮГСервисКомплекс: инициализация...');
    
    initSmoothScroll();
    initStickyHeader();
    initMobileBottomNav();
    initAnimations();
    initForms();
    initServicesTable();
    initModal();

    // Подсветка активного пункта в нижней навигации
    updateActiveBottomNav();
    window.addEventListener('hashchange', updateActiveBottomNav);
    
    // Кнопка "Наверх"
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('hidden', window.scrollY < 300);
            scrollBtn.classList.toggle('flex', window.scrollY >= 300);
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});

// ========== НАВИГАЦИЯ ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = window.innerWidth < 1024 ? 60 : 80;
                const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });
}

function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('bg-white/95', 'shadow-md', 'backdrop-blur-sm');
        } else {
            header.classList.remove('bg-white/95', 'shadow-md', 'backdrop-blur-sm');
        }
    });
}

function initMobileBottomNav() {
    const navItems = document.querySelectorAll('.fixed.bottom-0 a, .fixed.bottom-0 button');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.tagName === 'A') {
                navItems.forEach(i => i.classList.replace('text-blue-600', 'text-slate-600'));
                item.classList.replace('text-slate-600', 'text-blue-600');
            } else {
                navItems.forEach(i => i.classList.replace('text-blue-600', 'text-slate-600'));
            }
        });
    });
}

function updateActiveBottomNav() {
    const hash = window.location.hash || '#home';
    const navItems = document.querySelectorAll('.fixed.bottom-0 a, .fixed.bottom-0 button');
    navItems.forEach(item => {
        if (item.tagName === 'A') {
            const href = item.getAttribute('href');
            if (href === hash) {
                item.classList.replace('text-slate-600', 'text-blue-600');
            } else {
                item.classList.replace('text-blue-600', 'text-slate-600');
            }
        } else {
            item.classList.replace('text-blue-600', 'text-slate-600');
        }
    });
}

// ========== АНИМАЦИИ ==========
function initAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => observer.observe(el));

    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ========== ФОРМЫ ==========
function initForms() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const phone = contactForm.querySelector('input[type="tel"]').value.trim();
        const message = contactForm.querySelector('textarea').value.trim();

        if (!name || !phone) {
            showNotification('Заполните имя и телефон', 'error');
            return;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            showNotification('Введите корректный номер телефона', 'error');
            return;
        }

        const telegramMessage = `
<b>Новая заявка с сайта</b>
<b>Имя:</b> ${name}
<b>Телефон:</b> ${phone}
<b>Сообщение:</b> ${message || 'не указано'}
<b>Страница:</b> ${window.location.href}
        `.trim();

        try {
            await sendToTelegram(telegramMessage);
            showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('Telegram error:', error);
            showNotification('Ошибка отправки. Попробуйте позже или позвоните нам.', 'error');
        }
    });

    contactForm.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ========== ТАБЛИЦА УСЛУГ ==========
const servicesData = [
    { category: 'printers', name: 'Диагностика принтера', desc: 'Выявление неисправности, проверка всех узлов', price: '0' },
    { category: 'printers', name: 'Замена картриджа (лазерный)', desc: 'Совместимый картридж высокого качества', price: 'от 800' },
    { category: 'printers', name: 'Ремонт блока питания', desc: 'Восстановление или замена блока питания', price: 'от 1500' },
    { category: 'printers', name: 'Профилактика МФУ', desc: 'Чистка, смазка, замена роликов', price: '1200' },
    { category: 'pc', name: 'Диагностика ноутбука/ПК', desc: 'Бесплатно при ремонте', price: '0' },
    { category: 'pc', name: 'Чистка от пыли, замена термопасты', desc: 'Для ноутбуков и ПК', price: 'от 1200' },
    { category: 'pc', name: 'Замена клавиатуры ноутбука', desc: 'Подбор и установка новой клавиатуры', price: 'от 1500' },
    { category: 'pc', name: 'Замена матрицы ноутбука', desc: 'Оригинальная или совместимая', price: 'от 3500' },
    { category: 'pc', name: 'Установка Windows, драйверов', desc: 'Лицензия или сборка', price: '1000' },
    { category: 'pc', name: 'Ремонт монитора', desc: 'Замена подсветки, блока питания', price: 'от 2000' },
    { category: 'pc', name: 'Замена ИБП (аккумуляторов)', desc: 'Диагностика и замена', price: 'от 1000' },
    { category: 'cctv', name: 'Монтаж камеры видеонаблюдения', desc: 'Установка и настройка, прокладка кабеля', price: 'от 2500' },
    { category: 'cctv', name: 'Настройка видеорегистратора', desc: 'Подключение, удалённый доступ', price: '2000' },
    { category: 'vent', name: 'Чистка вентиляции', desc: 'Механическая чистка воздуховодов', price: 'от 3000' },
    { category: 'vent', name: 'Ремонт вентилятора', desc: 'Диагностика, замена двигателя', price: 'от 2500' },
    { category: 'industrial', name: 'Ремонт станков', desc: 'Диагностика и восстановление', price: 'договорная' },
    { category: 'industrial', name: 'Обслуживание производственных линий', desc: 'Плановое ТО', price: 'договорная' },
    { category: 'av', name: 'Настройка конференц-системы', desc: 'Подключение микрофонов, камер', price: 'от 3500' },
    { category: 'av', name: 'Установка аудиооборудования', desc: 'Монтаж и настройка звука', price: 'от 3000' },
    { category: 'large', name: 'Ремонт плоттера', desc: 'Механика, электроника', price: 'от 4000' },
    { category: 'large', name: 'Ремонт ризографа', desc: 'Диагностика, восстановление', price: 'от 4000' },
];

const categoryNames = {
    all: 'Все',
    printers: 'Принтеры и МФУ',
    pc: 'Ноутбуки, ПК, мониторы',
    cctv: 'Видеонаблюдение',
    vent: 'Вентиляция и кондиционирование',
    industrial: 'Производственное оборудование',
    av: 'Аудио/видео',
    large: 'Плоттеры, ризографы'
};

function initServicesTable() {
    const filtersContainer = document.getElementById('service-filters');
    const tableBody = document.getElementById('services-table-body');
    if (!filtersContainer || !tableBody) return;

    Object.keys(categoryNames).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-6 py-3 rounded-full font-medium transition-all ${
            cat === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-blue-100'
        }`;
        btn.dataset.filter = cat;
        btn.textContent = categoryNames[cat];
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-white', 'text-slate-700', 'hover:bg-blue-100');
            });
            btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-blue-100');
            btn.classList.add('bg-blue-600', 'text-white');
            renderServicesTable(cat);
        });
        filtersContainer.appendChild(btn);
    });

    renderServicesTable('all');
}

function renderServicesTable(category) {
    const tableBody = document.getElementById('services-table-body');
    if (!tableBody) return;

    const filtered = category === 'all' 
        ? servicesData 
        : servicesData.filter(s => s.category === category);

    tableBody.innerHTML = filtered.map(service => `
        <tr class="bg-white border-b hover:bg-slate-50">
            <td class="px-6 py-4 font-medium">${service.name}</td>
            <td class="px-6 py-4">${service.desc}</td>
            <td class="px-6 py-4">${service.price}</td>
        </tr>
    `).join('');
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    const modalForm = document.getElementById('modalForm');

    if (!overlay || !closeBtn || !modalForm) return;

    window.openModal = () => {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = modalForm.querySelector('input[type="text"]').value.trim();
        const phone = modalForm.querySelector('input[type="tel"]').value.trim();
        const message = modalForm.querySelector('textarea').value.trim();

        if (!name || !phone) {
            showNotification('Заполните имя и телефон', 'error');
            return;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            showNotification('Введите корректный номер телефона', 'error');
            return;
        }

        const telegramMessage = `
<b>Новая заявка (модальное окно)</b>
<b>Имя:</b> ${name}
<b>Телефон:</b> ${phone}
<b>Сообщение:</b> ${message || 'не указано'}
<b>Страница:</b> ${window.location.href}
        `.trim();

        try {
            await sendToTelegram(telegramMessage);
            showNotification('Спасибо! Мы свяжемся с вами.', 'success');
            closeModal();
            modalForm.reset();
        } catch (error) {
            console.error('Telegram error:', error);
            showNotification('Ошибка отправки. Попробуйте позже.', 'error');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// ========== ЗАЩИТА ОТ КОПИРОВАНИЯ ==========
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
        if (['c', 'x', 's', 'p', 'u', 'a'].includes(e.key)) {
            e.preventDefault();
        }
    }
    if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Скриншоты заблокированы для защиты контента.');
    }
});
