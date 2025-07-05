// Анимации GSAP + ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Прелоадер
window.addEventListener('load', () => {
    gsap.to('.preloader', {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
        }
    });
});

// Параллакс
document.querySelectorAll('.parallax').forEach(el => {
    gsap.to(el, {
        y: () => ScrollTrigger.maxScroll(window) * 0.1,
        ease: 'none',
        scrollTrigger: {
            trigger: el,
            scrub: true
        }
    });
});

// Смена темы
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.documentElement.setAttribute(
        'data-theme',
        document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
    );
    themeToggle.innerHTML = document.documentElement.getAttribute('data-theme') === 'light' 
        ? '<i class="fas fa-moon"></i>' 
        : '<i class="fas fa-sun"></i>';
});

// Анимации при скролле
document.querySelectorAll('[data-aos]').forEach(el => {
    gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });
});