/* ============================================
   F1 RED BULL RACING THEMED PORTFOLIO - JS
   Features:
   - Particle system (tire sparks / carbon fiber)
   - RPM gauge loader
   - Scroll-based telemetry (speed, sector)
   - Scroll-triggered reveal animations
   - Stat counter animation
   - Skill bar animation
   - Smooth nav highlighting
   - Mobile nav toggle
   ============================================ */

(function () {
    "use strict";

    // ---- INIT ----
    document.addEventListener("DOMContentLoaded", () => {
        initParticles();
    });

    // ---- PARTICLE SYSTEM (Racing Sparks) ----
    const canvas = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Color mix: red, yellow, white
            const colors = [
                `rgba(220, 0, 0, ${this.opacity})`,
                `rgba(255, 215, 0, ${this.opacity * 0.6})`,
                `rgba(255, 255, 255, ${this.opacity * 0.4})`,
                `rgba(37, 99, 235, ${this.opacity * 0.3})`,
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = Math.random() * 300 + 200;
            this.age = 0;
        }
        update() {
            // Mouse repulsion
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.speedX += (dx / dist) * force * 0.15;
                this.speedY += (dy / dist) * force * 0.15;
            }
            // Damping
            this.speedX *= 0.99;
            this.speedY *= 0.99;
            this.x += this.speedX;
            this.y += this.speedY;
            this.age++;
            if (this.age > this.life || this.x < -10 || this.x > canvas.width + 10 ||
                this.y < -10 || this.y > canvas.height + 10) {
                this.reset();
            }
        }
        draw() {
            const fadeOut = 1 - this.age / this.life;
            ctx.globalAlpha = fadeOut;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        // Use fewer particles on mobile for better performance
        const isMobile = window.innerWidth <= 600;
        const count = isMobile
            ? Math.min(40, Math.floor(window.innerWidth * 0.04))
            : Math.min(120, Math.floor(window.innerWidth * 0.08));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        animateParticles();
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const opacity = (1 - dist / 100) * 0.12;
                    ctx.strokeStyle = `rgba(220, 0, 0, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });
        ctx.globalAlpha = 1;
        animFrameId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ---- NAVBAR ----
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[data-sector]");
    const sectorDisplay = document.getElementById("currentSector");
    const speedDisplay = document.getElementById("scrollSpeed");

    let lastScrollY = 0;
    let scrollTimeout;

    function handleScroll() {
        const scrollY = window.scrollY;

        // Show navbar after hero
        if (scrollY > 200) {
            navbar.classList.add("visible");
        } else {
            navbar.classList.remove("visible");
        }

        // Calculate "speed"
        const delta = Math.abs(scrollY - lastScrollY);
        const speed = Math.min(Math.round(delta * 3.5), 350);
        speedDisplay.textContent = speed;
        lastScrollY = scrollY;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            speedDisplay.textContent = "0";
        }, 200);

        // Active section
        navLinks.forEach(link => {
            const sec = document.querySelector(link.getAttribute("href"));
            if (sec) {
                const rect = sec.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            }
        });

    }


    window.addEventListener("scroll", handleScroll, { passive: true });

    // ---- MOBILE NAV ----
    const navToggle = document.getElementById("navToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a");

    navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("active");
        mobileNav.classList.toggle("open");
    });
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            navToggle.classList.remove("active");
            mobileNav.classList.remove("open");
        });
    });

    // ---- SCROLL REVEAL ----
    function revealOnScroll() {
        const revealElements = document.querySelectorAll(
            ".timeline-item, .edu-card, .skill-category, .pub-card, .volunteer-card, .contact-card"
        );
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add("visible");
            }
        });
    }
    window.addEventListener("scroll", revealOnScroll, { passive: true });
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(revealOnScroll, 100);
    });

    // ---- STAT COUNTER ANIMATION ----
    function animateCounters() {
        const counters = document.querySelectorAll(".stat-num");
        counters.forEach(counter => {
            if (counter.dataset.animated) return;
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                counter.dataset.animated = "true";
                const target = parseInt(counter.getAttribute("data-target"));
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 30);
            }
        });
    }
    window.addEventListener("scroll", animateCounters, { passive: true });
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(animateCounters, 200);
    });



    // ---- RACE SPARK BURST ON CLICK / TOUCH ----
    function spawnSparks(clientX, clientY) {
        const sparkCount = 12;
        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement("div");
            spark.style.cssText = `
                position: fixed;
                left: ${clientX}px;
                top: ${clientY}px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: ${Math.random() > 0.5 ? '#dc0000' : '#ffd700'};
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 6px ${Math.random() > 0.5 ? '#dc0000' : '#ffd700'};
            `;
            document.body.appendChild(spark);

            const angle = (Math.PI * 2 / sparkCount) * i + Math.random() * 0.5;
            const velocity = 60 + Math.random() * 80;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let posX = clientX;
            let posY = clientY;
            let opacity = 1;
            let frame = 0;

            function animateSpark() {
                frame++;
                posX += vx * 0.03;
                posY += vy * 0.03 + frame * 0.15;
                opacity -= 0.04;
                spark.style.left = posX + "px";
                spark.style.top = posY + "px";
                spark.style.opacity = opacity;
                spark.style.transform = `scale(${opacity})`;
                if (opacity > 0) {
                    requestAnimationFrame(animateSpark);
                } else {
                    spark.remove();
                }
            }
            requestAnimationFrame(animateSpark);
        }
    }

    document.addEventListener("click", (e) => spawnSparks(e.clientX, e.clientY));
    document.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        if (t) spawnSparks(t.clientX, t.clientY);
    }, { passive: true });

    // ---- TILT EFFECT ON GLASS CARDS (desktop-only) ----
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouch) {
        document.querySelectorAll(".glass-card").forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -3;
                const rotateY = (x - centerX) / centerX * 3;
                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }

    // ---- RACING LINE TRAIL (mouse follow — desktop only) ----
    if (!isTouch) {
        let trail = [];
        const trailLength = 20;
        const trailCanvas = document.createElement("canvas");
        trailCanvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;";
        document.body.appendChild(trailCanvas);
        const trailCtx = trailCanvas.getContext("2d");

        function resizeTrailCanvas() {
            trailCanvas.width = window.innerWidth;
            trailCanvas.height = window.innerHeight;
        }
        resizeTrailCanvas();
        window.addEventListener("resize", resizeTrailCanvas);

        window.addEventListener("mousemove", (e) => {
            trail.push({ x: e.clientX, y: e.clientY, age: 0 });
            if (trail.length > trailLength) trail.shift();
        });

        function drawTrail() {
            trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            if (trail.length < 2) {
                requestAnimationFrame(drawTrail);
                return;
            }
            for (let i = 1; i < trail.length; i++) {
                const t = i / trail.length;
                trailCtx.beginPath();
                trailCtx.strokeStyle = `rgba(220, 0, 0, ${t * 0.4})`;
                trailCtx.lineWidth = t * 2.5;
                trailCtx.lineCap = "round";
                trailCtx.moveTo(trail[i - 1].x, trail[i - 1].y);
                trailCtx.lineTo(trail[i].x, trail[i].y);
                trailCtx.stroke();
            }
            // Age and remove old points
            trail.forEach(p => p.age++);
            trail = trail.filter(p => p.age < 8);
            requestAnimationFrame(drawTrail);
        }
        requestAnimationFrame(drawTrail);
    }

    // ---- SPEED LINES ON FAST SCROLL ----
    let speedLinesActive = false;
    window.addEventListener("scroll", () => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        if (delta > 30 && !speedLinesActive) {
            speedLinesActive = true;
            document.body.style.setProperty("--speed-line-opacity", "1");
            setTimeout(() => {
                speedLinesActive = false;
                document.body.style.setProperty("--speed-line-opacity", "0");
            }, 150);
        }
    }, { passive: true });

})();
