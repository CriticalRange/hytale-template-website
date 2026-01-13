"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ModConfig,
  generateModId,
  generateClassName,
  validatePackageName,
  generateTemplateFromScratch,
} from "@/lib/template-generator";

// Native download function
function downloadBlob(blob: Blob, filename: string) {
  const zipBlob = new Blob([blob], { type: "application/zip" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Cursor glow with smooth trailing
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.1;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.1;

      if (glowRef.current) {
        glowRef.current.style.left = `${posRef.current.x}px`;
        glowRef.current.style.top = `${posRef.current.y}px`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}

// Floating particles
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle animate-float"
          style={{
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            background: `rgba(59, 130, 246, ${0.1 + i * 0.05})`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${8 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated logo
function Logo({ size = 64, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <div className={`logo-container ${animate ? 'animate-bounce-slow' : ''}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="48" height="48" rx="12" fill="#ea580c" />
        <path
          d="M20 32L32 20L44 32L32 44L20 32Z"
          fill="white"
          className="animate-pulse-glow"
        />
        <circle cx="32" cy="32" r="4" fill="#ea580c" />
      </svg>
    </div>
  );
}

// Arrow icons with animation
function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="transition-transform group-hover:translate-x-1"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="transition-transform group-hover:-translate-x-1"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// Check icon with animation
function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Download icon
function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

// Sparkle icon
function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse-glow">
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
    </svg>
  );
}

// Wizard step types  
type WizardStep = "welcome" | "basics" | "options" | "review" | "complete";

export default function Home() {
  // Wizard state
  const [step, setStep] = useState<WizardStep>("welcome");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form state
  const [modName, setModName] = useState("My Mod");
  const [packageName, setPackageName] = useState("com.example");
  const [javaVersion, setJavaVersion] = useState("21");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [website, setWebsite] = useState("");
  const [includeExampleCommand, setIncludeExampleCommand] = useState(true);
  const [includeExampleEvent, setIncludeExampleEvent] = useState(true);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const modId = generateModId(modName);
  const className = generateClassName(modName);
  const isPackageValid = validatePackageName(packageName);
  const entryPoint = `${packageName}.${className}`;

  const steps: WizardStep[] = ["welcome", "basics", "options", "review", "complete"];
  const currentStepIndex = steps.indexOf(step);

  // Animated step transition
  const goToStep = (newStep: WizardStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 200);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex]);
    }
  };

  // Handle download
  const handleGenerate = useCallback(async () => {
    if (!isPackageValid) {
      setError("Invalid package name");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config: ModConfig = {
        modName,
        modId,
        packageName,
        version: "1.0.0",
        description: description || `A Hytale mod`,
        authorName: authorName || "Author",
        authorEmail: "author@example.com",
        website: website || "https://example.com",
        javaVersion,
        serverVersion: "*",
        includeExampleCommand,
        includeExampleEvent,
      };

      const blob = await generateTemplateFromScratch(config);
      downloadBlob(blob, `${className}.zip`);
      goToStep("complete");
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }, [modName, modId, packageName, description, authorName, website, javaVersion, includeExampleCommand, includeExampleEvent, className, isPackageValid]);

  const resetWizard = () => {
    goToStep("welcome");
    setTimeout(() => {
      setModName("My Mod");
      setPackageName("com.example");
      setJavaVersion("21");
      setDescription("");
      setAuthorName("");
      setWebsite("");
      setIncludeExampleCommand(true);
      setIncludeExampleEvent(true);
      setError(null);
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <CursorGlow />
      <Particles />

      {/* Main Content */}
      <main
        className={`w-full max-w-lg transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
      >
        {/* Welcome Screen */}
        {step === "welcome" && (
          <div className="hero stagger-children">
            <div className="animate-fade-in-up">
              <Logo size={72} />
            </div>
            <h1 className="animate-fade-in-up">Create Your Mod</h1>
            <p className="animate-fade-in-up">
              Build a Hytale mod template in seconds.
              We&apos;ll guide you through the setup.
            </p>
            <button className="btn-primary group animate-fade-in-up animate-pulse-glow" onClick={nextStep}>
              Get Started <ArrowRight />
            </button>
            <p className="text-sm text-[var(--text-muted)] mt-12 animate-fade-in-up flex items-center justify-center gap-2">
              <Sparkle />
              CC0 License — Use freely
              <Sparkle />
            </p>
          </div>
        )}

        {/* Step: Basics */}
        {step === "basics" && (
          <div className="animate-scale-in">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-2">Basic Info</h2>
              <p className="text-[var(--text-muted)] text-sm mb-8">
                Let&apos;s start with the essentials.
              </p>

              <div className="space-y-6 stagger-children">
                <div className="animate-fade-in-up">
                  <label className="form-label">Mod Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={modName}
                    onChange={(e) => setModName(e.target.value)}
                    placeholder="My Awesome Mod"
                  />
                  <p className="form-hint">
                    ID: <code>{modId}</code>
                  </p>
                </div>

                <div className="animate-fade-in-up">
                  <label className="form-label">Package Name</label>
                  <input
                    type="text"
                    className={`form-input ${!isPackageValid && packageName ? "!border-red-500" : ""}`}
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value.toLowerCase())}
                    placeholder="com.yourname.modid"
                  />
                  {!isPackageValid && packageName && (
                    <p className="form-hint text-red-500">
                      Use lowercase letters and dots only
                    </p>
                  )}
                </div>

                <div className="animate-fade-in-up">
                  <label className="form-label">Java Version</label>
                  <select
                    className="form-select"
                    value={javaVersion}
                    onChange={(e) => setJavaVersion(e.target.value)}
                  >
                    <option value="21">Java 21 (LTS - Recommended)</option>
                    <option value="22">Java 22</option>
                    <option value="23">Java 23</option>
                    <option value="24">Java 24</option>
                    <option value="25">Java 25</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button className="btn-secondary flex-1 group" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button
                  className="btn-primary flex-1 group"
                  onClick={nextStep}
                  disabled={!isPackageValid || !modName}
                >
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Options */}
        {step === "options" && (
          <div className="animate-scale-in">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-2">Options</h2>
              <p className="text-[var(--text-muted)] text-sm mb-8">
                Choose what to include.
              </p>

              <div className="space-y-4 stagger-children">
                <div
                  className={`option-card animate-fade-in-up ${includeExampleCommand ? "selected" : ""}`}
                  onClick={() => setIncludeExampleCommand(!includeExampleCommand)}
                >
                  <input
                    type="checkbox"
                    checked={includeExampleCommand}
                    onChange={() => { }}
                  />
                  <div>
                    <div className="font-semibold">Example Command</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      A working in-game command to learn the API
                    </p>
                  </div>
                </div>

                <div
                  className={`option-card animate-fade-in-up ${includeExampleEvent ? "selected" : ""}`}
                  onClick={() => setIncludeExampleEvent(!includeExampleEvent)}
                >
                  <input
                    type="checkbox"
                    checked={includeExampleEvent}
                    onChange={() => { }}
                  />
                  <div>
                    <div className="font-semibold">Example Event</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Welcomes players when they join
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--card-border)] stagger-children">
                <p className="text-sm text-[var(--text-muted)] mb-5 animate-fade-in-up">Optional details</p>
                <div className="space-y-5">
                  <div className="animate-fade-in-up">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A short description..."
                    />
                  </div>
                  <div className="grid-2 animate-fade-in-up">
                    <div>
                      <label className="form-label">Author</label>
                      <input
                        type="text"
                        className="form-input"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Website</label>
                      <input
                        type="text"
                        className="form-input"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button className="btn-secondary flex-1 group" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button className="btn-primary flex-1 group" onClick={nextStep}>
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="animate-scale-in">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-2">Ready!</h2>
              <p className="text-[var(--text-muted)] text-sm mb-8">
                Review and download your mod template.
              </p>

              <div className="space-y-3 mb-8 stagger-children">
                <div className="flex justify-between py-3 border-b border-[var(--card-border)] animate-fade-in-up">
                  <span className="text-[var(--text-muted)]">Mod</span>
                  <span className="font-semibold">{modName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--card-border)] animate-fade-in-up">
                  <span className="text-[var(--text-muted)]">Package</span>
                  <code className="text-sm">{packageName}</code>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--card-border)] animate-fade-in-up">
                  <span className="text-[var(--text-muted)]">Java</span>
                  <span>{javaVersion}</span>
                </div>
                <div className="flex justify-between py-3 animate-fade-in-up">
                  <span className="text-[var(--text-muted)]">Examples</span>
                  <span className="text-right">
                    {includeExampleCommand && includeExampleEvent
                      ? "Command + Event"
                      : includeExampleCommand
                        ? "Command"
                        : includeExampleEvent
                          ? "Event"
                          : "None"}
                  </span>
                </div>
              </div>

              <div className="code-box text-sm mb-8 animate-fade-in-up">
                <div className="mb-3">
                  <span className="path">Entry:</span>{" "}
                  <span className="file">{entryPoint}</span>
                </div>
                <div className="space-y-1">
                  <div><span className="file">{className}.java</span></div>
                  {includeExampleCommand && (
                    <div><span className="path">└─ </span><span className="file-cmd">{className}Command.java</span></div>
                  )}
                  {includeExampleEvent && (
                    <div><span className="path">└─ </span><span className="file-event">{className}Event.java</span></div>
                  )}
                </div>
              </div>

              {error && (
                <div className="error-box mb-6">{error}</div>
              )}

              <div className="flex gap-4">
                <button className="btn-secondary flex-1 group" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button
                  className="btn-primary flex-1 group animate-shimmer"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner" /> Generating...
                    </>
                  ) : (
                    <>
                      <DownloadIcon /> Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <div className="text-center py-8 stagger-children">
            <div className="success-icon inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white mb-8 animate-fade-in-up">
              <CheckIcon />
            </div>
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">Done! 🎉</h2>
            <p className="text-[var(--text-muted)] mb-10 animate-fade-in-up">
              <strong>{className}.zip</strong> is downloading.<br />
              Extract and run <code>./gradlew build</code>
            </p>
            <div className="flex gap-4 justify-center animate-fade-in-up">
              <button className="btn-secondary group" onClick={resetWizard}>
                <ArrowLeft /> Create Another
              </button>
              <a
                href="https://hytale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
              >
                Visit Hytale <ArrowRight />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer - minimal */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center z-10">
        <p className="text-xs text-[var(--text-muted)] opacity-50">
          Not affiliated with Hypixel Studios
        </p>
      </footer>
    </div>
  );
}
