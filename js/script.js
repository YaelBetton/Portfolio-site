document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;
    const themeIcon = themeToggle?.querySelector('span');

    function updateToggleIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
    } else {
        body.removeAttribute('data-theme');
    }
    updateToggleIcon(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const isDark = body.hasAttribute('data-theme');
        const newTheme = isDark ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const mailStatus = urlParams.get('mail');
    const contactMessage = document.getElementById('contact-message');
    if (contactMessage && (mailStatus === 'ok' || mailStatus === 'error')) {
        contactMessage.classList.add('is-visible');
        contactMessage.classList.remove('contact-message--success', 'contact-message--error');
        if (mailStatus === 'ok') {
            contactMessage.classList.add('contact-message--success');
            contactMessage.textContent = 'Message envoye avec succes. Merci pour votre message !';
        } else {
            contactMessage.classList.add('contact-message--error');
            contactMessage.textContent = 'Erreur lors de l\'envoi du message. Verifiez les champs et reessayez.';
        }
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.project-card, .stat, .skill-category');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        setTimeout(() => {
            typeWriter(heroSubtitle, "Développeur / Concepteur d'applications", 150);
        }, 1500);
    }

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ff0000';
            } else {
                this.style.borderColor = '#000000';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#000000';
        });
    });

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: ${scrollPercent}%;
                height: 2px;
                background: #000000;
                z-index: 9999;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        } else {
            progressBar.style.width = scrollPercent + '%';
        }
    }

    window.addEventListener('scroll', updateScrollProgress);
});

// --- Modal logic for Competences ---
window.openCompModal = function(cardElement) {
    const modal = document.getElementById('compModal');
    const modalBodyContent = document.getElementById('modal-body-content');
    const hiddenData = cardElement.querySelector('.competence-data');
    
    if (modal && modalBodyContent && hiddenData) {
        modalBodyContent.innerHTML = hiddenData.innerHTML;
        modal.style.display = 'flex';
        document.documentElement.classList.add('modal-open'); 
    }
};

window.closeCompModal = function() {
    const modal = document.getElementById('compModal');
    if (modal) {
        modal.style.display = 'none';
        document.documentElement.classList.remove('modal-open');
    }
};

window.addEventListener('click', function(event) {
    const modal = document.getElementById('compModal');
    if (event.target == modal) {
        window.closeCompModal();
    }
});