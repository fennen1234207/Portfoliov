// Анимации GSAP
gsap.from(".logo", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
gsap.from(".nav-links li", { duration: 1, y: -50, opacity: 0, stagger: 0.1, delay: 0.5 });
gsap.from(".hero-title", { duration: 1, x: -50, opacity: 0, delay: 0.8 });
gsap.from(".hero-subtitle", { duration: 1, x: -50, opacity: 0, delay: 1 });
gsap.from(".cta-button", { duration: 1, y: 50, opacity: 0, delay: 1.2 });

// Меню-бургер
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links li");

burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    burger.classList.toggle("active");
});

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navLinks.classList.remove("active");
        burger.classList.remove("active");
    });
});

// Переключатель темы
const themeToggle = document.querySelector(".theme-toggle");
const html = document.documentElement;

themeToggle.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", html.dataset.theme);
});

// Сохранение темы
const savedTheme = localStorage.getItem("theme") || "dark";
html.dataset.theme = savedTheme;

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});