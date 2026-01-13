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

// Cursor glow component
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}

// Logo
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#ea580c" />
      <path d="M10 16L16 10L22 16L16 22L10 16Z" fill="white" />
    </svg>
  );
}

// Arrow icons
function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// Check icon
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
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

// Wizard step types
type WizardStep = "welcome" | "basics" | "options" | "review" | "complete";

export default function Home() {
  // Wizard state
  const [step, setStep] = useState<WizardStep>("welcome");

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
      setStep("complete");
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }, [modName, modId, packageName, description, authorName, website, javaVersion, includeExampleCommand, includeExampleEvent, className, isPackageValid]);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const resetWizard = () => {
    setStep("welcome");
    setModName("My Mod");
    setPackageName("com.example");
    setJavaVersion("21");
    setDescription("");
    setAuthorName("");
    setWebsite("");
    setIncludeExampleCommand(true);
    setIncludeExampleEvent(true);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CursorGlow />

      {/* Header */}
      <header className="header">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetWizard}>
            <Logo />
            <span className="font-semibold">Hytale Modding</span>
          </div>
          <nav className="flex items-center gap-1">
            <a href="#" className="nav-link active">Template</a>
            <a href="https://hytale.com" target="_blank" rel="noopener noreferrer" className="nav-link">
              Hytale ↗
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Welcome Screen */}
        {step === "welcome" && (
          <div className="hero">
            <div className="float mb-8">
              <Logo />
            </div>
            <h1>Create Your Hytale Mod</h1>
            <p>
              Generate a customized mod template in seconds.
              We&apos;ll guide you through the setup step by step.
            </p>
            <button className="btn-primary" onClick={nextStep}>
              Get Started <ArrowRight />
            </button>
            <p className="text-sm text-[var(--text-muted)] mt-8">
              Available under{" "}
              <a href="https://creativecommons.org/publicdomain/zero/1.0/" className="link" target="_blank" rel="noopener noreferrer">
                CC0 License
              </a>
            </p>
          </div>
        )}

        {/* Step: Basics */}
        {step === "basics" && (
          <div className="w-full max-w-md">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold mb-2">Basic Information</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Let&apos;s start with the essentials.
              </p>

              <div className="space-y-5">
                <div>
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

                <div>
                  <label className="form-label">Package Name</label>
                  <input
                    type="text"
                    className={`form-input ${!isPackageValid && packageName ? "border-red-500" : ""}`}
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value.toLowerCase())}
                    placeholder="com.yourname.modid"
                  />
                  {!isPackageValid && packageName && (
                    <p className="form-hint text-red-500">
                      Invalid format. Use lowercase letters and dots.
                    </p>
                  )}
                </div>

                <div>
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

              <div className="flex gap-3 mt-8">
                <button className="btn-secondary flex-1" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button
                  className="btn-primary flex-1"
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
          <div className="w-full max-w-md">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold mb-2">Choose Options</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Select what to include in your template.
              </p>

              <div className="space-y-3">
                <label
                  className={`option-card ${includeExampleCommand ? "selected" : ""}`}
                  onClick={() => setIncludeExampleCommand(!includeExampleCommand)}
                >
                  <input
                    type="checkbox"
                    checked={includeExampleCommand}
                    onChange={() => { }}
                  />
                  <div>
                    <div className="font-medium">Example Command</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      A basic in-game command to help you learn the API.
                    </p>
                  </div>
                </label>

                <label
                  className={`option-card ${includeExampleEvent ? "selected" : ""}`}
                  onClick={() => setIncludeExampleEvent(!includeExampleEvent)}
                >
                  <input
                    type="checkbox"
                    checked={includeExampleEvent}
                    onChange={() => { }}
                  />
                  <div>
                    <div className="font-medium">Example Event Handler</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Welcomes players when they join the server.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                <p className="text-sm text-[var(--text-muted)] mb-4">Optional details</p>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A short description..."
                    />
                  </div>
                  <div className="grid-2">
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

              <div className="flex gap-3 mt-8">
                <button className="btn-secondary flex-1" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button className="btn-primary flex-1" onClick={nextStep}>
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="w-full max-w-md">
            <div className="steps-indicator">
              {steps.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  className={`step-dot ${i === currentStepIndex - 1 ? "active" : ""} ${i < currentStepIndex - 1 ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold mb-2">Review & Download</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Everything looks good? Let&apos;s generate your mod!
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)]">Mod Name</span>
                  <span className="font-medium">{modName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)]">Package</span>
                  <span className="font-mono text-sm">{packageName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)]">Java Version</span>
                  <span>Java {javaVersion}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-muted)]">Example Code</span>
                  <span>
                    {includeExampleCommand && includeExampleEvent
                      ? "Command + Event"
                      : includeExampleCommand
                        ? "Command only"
                        : includeExampleEvent
                          ? "Event only"
                          : "None"}
                  </span>
                </div>
              </div>

              <div className="code-box text-sm mb-6">
                <div className="mb-2">
                  <span className="path">Entry:</span>{" "}
                  <span className="file">{entryPoint}</span>
                </div>
                <div className="space-y-0.5">
                  <div><span className="path">src/.../</span><span className="file">{className}.java</span></div>
                  {includeExampleCommand && (
                    <div><span className="path">commands/</span><span className="file-cmd">{className}Command.java</span></div>
                  )}
                  {includeExampleEvent && (
                    <div><span className="path">events/</span><span className="file-event">{className}Event.java</span></div>
                  )}
                </div>
              </div>

              {error && (
                <div className="error-box mb-4">{error}</div>
              )}

              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={prevStep}>
                  <ArrowLeft /> Back
                </button>
                <button
                  className="btn-primary flex-1"
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
          <div className="text-center max-w-md px-4">
            <div className="success-check inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 text-white mb-6">
              <CheckIcon />
            </div>
            <h2 className="text-2xl font-bold mb-3">Download Started!</h2>
            <p className="text-[var(--text-muted)] mb-8">
              Your <strong>{className}.zip</strong> template is downloading.
              Extract it and run <code>./gradlew build</code> to get started.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="btn-secondary" onClick={resetWizard}>
                Create Another
              </button>
              <a
                href="https://hytale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Visit Hytale ↗
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          <p>NOT AN OFFICIAL HYTALE PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH HYPIXEL STUDIOS.</p>
        </div>
      </footer>
    </div>
  );
}
