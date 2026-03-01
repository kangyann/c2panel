"use client"
import React, { useEffect, useRef, useState } from 'react';
import '@/app/app.css';

/*
  CC Infinity Path:
  Flow: (1) bottom-right tail (268,140) → LEFT through center (160,80) →
        around left C counterclockwise → back through center →
        (2) up to top-right tail (268,18)

  The path is OPEN (not closed). Left C is a full loop,
  right C has a gap (opening on the right side).
*/
const CC_PATH = 'M 268 140 C 228 158, 188 125, 160 80 C 132 35, 85 8, 48 18 C 12 28, 4 55, 4 80 C 4 105, 12 132, 48 142 C 85 152, 132 125, 160 80 C 188 35, 228 5, 268 18';

// Reverse path (top-right → around left C → bottom-right)
const CC_PATH_REVERSE = 'M 268 18 C 228 5, 188 35, 160 80 C 132 125, 85 152, 48 142 C 12 132, 4 105, 4 80 C 4 55, 12 28, 48 18 C 85 8, 132 35, 160 80 C 188 125, 228 158, 268 140';

const Index2: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorGlowRef = useRef<HTMLDivElement>(null);
    const progressFillRef = useRef<HTMLDivElement>(null);
    const progressValueRef = useRef<HTMLSpanElement>(null);
    const logoWrapperRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState<string>('');
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const clickCountRef = useRef<number>(0);

    // Particle System
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationId: number;

        const colors: [number, number, number][] = [
            [92, 225, 230],
            [56, 189, 248],
            [14, 165, 199],
            [11, 37, 64],
        ];

        interface ParticleData {
            x: number; y: number; size: number;
            speedX: number; speedY: number;
            opacity: number; life: number;
            color: [number, number, number];
        }

        const particles: ParticleData[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const resetParticle = (p: ParticleData): ParticleData => {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.size = Math.random() * 2 + 0.5;
            p.speedX = (Math.random() - 0.5) * 0.4;
            p.speedY = (Math.random() - 0.5) * 0.4;
            p.opacity = Math.random() * 0.3 + 0.1;
            p.life = Math.random() * 200 + 100;
            p.color = colors[Math.floor(Math.random() * colors.length)];
            return p;
        };

        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        for (let i = 0; i < particleCount; i++) {
            particles.push(resetParticle({
                x: 0, y: 0, size: 0, speedX: 0, speedY: 0, opacity: 0, life: 0, color: [0, 0, 0]
            }));
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.life--;
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150 && dist > 0) {
                    const force = (150 - dist) / 150 * 0.02;
                    p.speedX += (dx / dist) * force;
                    p.speedY += (dy / dist) * force;
                }
                p.speedX *= 0.99;
                p.speedY *= 0.99;
                if (p.life < 30) p.opacity = (p.life / 30) * 0.3;
                if (p.life <= 0 || p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) resetParticle(p);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
                ctx.fill();
            });

            // Connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(14, 165, 199, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    // Mouse tracking + parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            if (cursorGlowRef.current) {
                cursorGlowRef.current.style.left = e.clientX + 'px';
                cursorGlowRef.current.style.top = e.clientY + 'px';
            }
            const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
            document.querySelectorAll<HTMLElement>('.orb').forEach((orb, i) => {
                const speed = (i + 1) * 5;
                orb.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
            });
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Progress animation
    useEffect(() => {
        const targetProgress = 73;
        const timeout = setTimeout(() => {
            if (progressFillRef.current) progressFillRef.current.style.width = targetProgress + '%';
            let current = 0;
            const interval = setInterval(() => {
                current++;
                if (progressValueRef.current) progressValueRef.current.textContent = current + '%';
                if (current >= targetProgress) clearInterval(interval);
            }, 25);
        }, 1200);
        return () => clearTimeout(timeout);
    }, []);

    const handleLogoClick = (): void => {
        clickCountRef.current++;
        const wrapper = logoWrapperRef.current;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.style.cssText = `position:fixed;top:${rect.top + rect.height / 2}px;left:${rect.left + rect.width / 2}px;width:10px;height:10px;background:rgba(14,165,199,0.3);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);animation:rippleEffect 0.8s ease-out forwards;z-index:10;`;
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 800);
        }
        if (clickCountRef.current >= 5) {
            clickCountRef.current = 0;
            document.body.style.transition = 'filter 0.5s';
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => { document.body.style.filter = 'none'; }, 2000);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!email) return;
        setIsSubscribed(true);
        setEmail('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => setIsSubscribed(false), 4000);
    };

    return (
        <>
            <canvas id="particles-canvas" ref={canvasRef} />
            <div className="grid-overlay" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="cursor-glow" ref={cursorGlowRef} />

            <div className="main-container">

                {/* CC Infinity Logo */}
                <div className="logo-wrapper" ref={logoWrapperRef} onClick={handleLogoClick}>
                    <div className="logo-glow" />
                    <div className="logo-icon">
                        <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-glow-filter">
                            <defs>
                                <linearGradient id="ccGrad" x1="0" y1="80" x2="320" y2="80" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#5ce1e6" />
                                    <stop offset="30%" stopColor="#38bdf8" />
                                    <stop offset="60%" stopColor="#0ea5c7" />
                                    <stop offset="100%" stopColor="#0b2540" />
                                </linearGradient>

                                <linearGradient id="ccGradFlow" x1="0" y1="80" x2="320" y2="80" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#5ce1e6">
                                        <animate attributeName="stop-color" values="#5ce1e6;#38bdf8;#0ea5c7;#5ce1e6" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="35%" stopColor="#38bdf8">
                                        <animate attributeName="stop-color" values="#38bdf8;#0ea5c7;#5ce1e6;#38bdf8" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="65%" stopColor="#0ea5c7">
                                        <animate attributeName="stop-color" values="#0ea5c7;#0b2540;#38bdf8;#0ea5c7" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="100%" stopColor="#0b2540">
                                        <animate attributeName="stop-color" values="#0b2540;#5ce1e6;#0b2540;#0b2540" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                </linearGradient>

                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Main stroke - draw animation from bottom-right (1) to top-right (2) */}
                            <path
                                className="cc-path"
                                d={CC_PATH}
                                stroke="url(#ccGrad)"
                                strokeWidth="18"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                filter="url(#glow)"
                            />

                            {/* Flowing sparkle overlay */}
                            <path
                                className="cc-flow"
                                d={CC_PATH}
                                stroke="url(#ccGradFlow)"
                                strokeWidth="18"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                strokeDasharray="40 700"
                            />

                            {/* Sparkle dot 1: cyan */}
                            <circle r="3" fill="#5ce1e6" opacity="0">
                                <animateMotion dur="4s" repeatCount="indefinite" begin="2.8s" path={CC_PATH} />
                                <animate attributeName="opacity" values="0;0.9;0.9;0" dur="4s" repeatCount="indefinite" begin="2.8s" />
                            </circle>

                            {/* Sparkle dot 2: light blue, reverse */}
                            <circle r="2.5" fill="#38bdf8" opacity="0">
                                <animateMotion dur="5s" repeatCount="indefinite" begin="3.5s" path={CC_PATH_REVERSE} />
                                <animate attributeName="opacity" values="0;0.7;0.7;0" dur="5s" repeatCount="indefinite" begin="3.5s" />
                            </circle>

                            {/* Sparkle dot 3: white */}
                            <circle r="2" fill="#ffffff" opacity="0">
                                <animateMotion dur="3.5s" repeatCount="indefinite" begin="4s" path={CC_PATH} />
                                <animate attributeName="opacity" values="0;0.5;0.5;0" dur="3.5s" repeatCount="indefinite" begin="4s" />
                            </circle>
                        </svg>
                    </div>
                </div>

                <h1 className="title">C2 Panel</h1>
                <p className="subtitle">We&apos;re crafting something extraordinary</p>

                <div className="status-card">
                    <div className="status-indicator">
                        <span className="status-dot" />
                        Under Development
                    </div>
                    <h2 className="card-title">Maintenance Mode</h2>
                    <p className="card-description">
                        Our team is working hard to deliver a premium experience. The system is being upgraded with new features and improvements.
                    </p>
                    <div className="progress-wrapper">
                        <div className="progress-header">
                            <span className="progress-label">Build Progress</span>
                            <span className="progress-value" ref={progressValueRef}>0%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" ref={progressFillRef} />
                        </div>
                    </div>
                    <form className="notify-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="notify-input"
                            placeholder="Enter your email for updates"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubscribed}
                            required
                        />
                        <button type="submit" className={`notify-btn ${isSubscribed ? 'success' : ''}`} disabled={isSubscribed}>
                            {isSubscribed ? '✓ Subscribed' : 'Notify Me'}
                        </button>
                    </form>
                </div>

                <div className="features">
                    <div className="chip">
                        <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        Secure Auth
                    </div>
                    <div className="chip">
                        <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        Dashboard
                    </div>
                    <div className="chip">
                        <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                        Real-time Analytics
                    </div>
                    <div className="chip">
                        <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                        API Integration
                    </div>
                </div>
            </div>

            <footer className="footer">
                <p className="footer-text">© 2026 C2 Panel. All rights reserved.</p>
            </footer>

            <div className={`toast ${showToast ? 'show' : ''}`}>✓ You&apos;ll be notified when we launch!</div>
        </>
    );
};

export default Index2;
