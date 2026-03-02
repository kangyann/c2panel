"use client";
import React, { useEffect, useRef, useState } from "react";
import "@/app/app.css";
export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressValueRef = useRef<HTMLSpanElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState<string>("");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const clickCountRef = useRef<number>(0);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId: number;

    interface ParticleData {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      life: number;
    }

    const particles: ParticleData[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const resetParticle = (p: ParticleData): ParticleData => {
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * canvas.height;
      p.size = Math.random() * 2 + 0.5;
      p.speedX = (Math.random() - 0.5) * 0.4;
      p.speedY = (Math.random() - 0.5) * 0.4;
      p.opacity = Math.random() * 0.3 + 0.1;
      p.life = Math.random() * 200 + 100;
      return p;
    };

    const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < particleCount; i++) {
      particles.push(resetParticle({ x: 0, y: 0, size: 0, speedX: 0, speedY: 0, opacity: 0, life: 0 }));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = ((150 - dist) / 150) * 0.02;
          p.speedX += (dx / dist) * force;
          p.speedY += (dy / dist) * force;
        }
        p.speedX *= 0.99;
        p.speedY *= 0.99;
        if (p.life < 30) p.opacity = (p.life / 30) * 0.3;
        if (p.life <= 0 || p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20)
          resetParticle(p);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(67, 97, 238, ${p.opacity})`;
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
            ctx.strokeStyle = `rgba(67, 97, 238, ${opacity})`;
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
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Mouse tracking + parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = e.clientX + "px";
        cursorGlowRef.current.style.top = e.clientY + "px";
      }
      const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
      document.querySelectorAll<HTMLElement>(".orb").forEach((orb, i) => {
        const speed = (i + 1) * 5;
        orb.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Progress animation
  useEffect(() => {
    const targetProgress = 73;
    const timeout = setTimeout(() => {
      if (progressFillRef.current) progressFillRef.current.style.width = targetProgress + "%";
      let current = 0;
      const interval = setInterval(() => {
        current++;
        if (progressValueRef.current) progressValueRef.current.textContent = current + "%";
        if (current >= targetProgress) clearInterval(interval);
      }, 25);
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  const handleLogoClick = (): void => {
    clickCountRef.current++;
    const wrapper = logoWrapperRef.current;
    if (wrapper) {
      const ripple = document.createElement("div");
      ripple.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:rgba(67,97,238,0.3);border-radius:50%;pointer-events:none;animation:rippleEffect 0.8s ease-out forwards;`;
      wrapper.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    }
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      document.body.style.transition = "filter 0.5s";
      document.body.style.filter = "hue-rotate(180deg)";
      setTimeout(() => {
        document.body.style.filter = "none";
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email) return;
    const fetching = await fetch("http://localhost:3000/api/send-mail", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const res = await fetching.json();
    setIsSubscribed(true);
    setEmail("");
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
        <div className="logo-wrapper" ref={logoWrapperRef} onClick={handleLogoClick}>
          <div className="logo-glow" />
          <div className="logo-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4361ee" />
                  <stop offset="100%" stopColor="#7209b7" />
                </linearGradient>
                <linearGradient id="logoGrad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#7209b7" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M40 4L72 20V60L40 76L8 60V20L40 4Z"
                fill="url(#logoGrad2)"
                stroke="url(#logoGrad)"
                strokeWidth="2"
              />
              <path
                d="M40 12L64 24V56L40 68L16 56V24L40 12Z"
                fill="none"
                stroke="url(#logoGrad)"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x="40"
                y="46"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                fontSize="22"
                fill="url(#logoGrad)"
              >
                C2
              </text>
              <circle cx="40" cy="4" r="3" fill="url(#logoGrad)" opacity="0.6" />
              <circle cx="72" cy="20" r="2.5" fill="url(#logoGrad)" opacity="0.4" />
              <circle cx="72" cy="60" r="2.5" fill="url(#logoGrad)" opacity="0.4" />
              <circle cx="40" cy="76" r="3" fill="url(#logoGrad)" opacity="0.6" />
              <circle cx="8" cy="60" r="2.5" fill="url(#logoGrad)" opacity="0.4" />
              <circle cx="8" cy="20" r="2.5" fill="url(#logoGrad)" opacity="0.4" />
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
            Our team is working hard to deliver a premium experience. The system is being upgraded with new features and
            improvements.
          </p>
          <div className="progress-wrapper">
            <div className="progress-header">
              <span className="progress-label">Build Progress</span>
              <span className="progress-value" ref={progressValueRef}>
                0%
              </span>
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
            <button type="submit" className={`notify-btn ${isSubscribed ? "success" : ""}`} disabled={isSubscribed}>
              {isSubscribed ? "✓ Subscribed" : "Notify Me"}
            </button>
          </form>
        </div>

        <div className="features">
          <div className="chip">
            <svg
              className="chip-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure Auth
          </div>
          <div className="chip">
            <svg
              className="chip-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Dashboard
          </div>
          <div className="chip">
            <svg
              className="chip-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Real-time Analytics
          </div>
          <div className="chip">
            <svg
              className="chip-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            API Integration
          </div>
        </div>
      </div>

      <footer className="footer">
        <p className="footer-text">© 2026 C2 Panel. All rights reserved.</p>
      </footer>

      <div className={`toast  ${showToast ? "show" : ""}`}>✓ You&apos;ll be notified when we launch!</div>
    </>
  );
}
