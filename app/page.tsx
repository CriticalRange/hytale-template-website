"use client";

import { useState, useCallback } from "react";
import {
  ModConfig,
  generateModId,
  generateClassName,
  validatePackageName,
  generateTemplate,
} from "@/lib/template-generator";

// Native download function
function downloadBlob(blob: Blob, filename: string) {
  const zipBlob = new Blob([blob], { type: 'application/zip' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Simple Hytale-inspired logo
function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#ea580c" />
      <path d="M10 16L16 10L22 16L16 22L10 16Z" fill="white" />
    </svg>
  );
}

// Chevron icon
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Home() {
  // Form state
  const [modName, setModName] = useState("Example Mod");
  const [useCustomId, setUseCustomId] = useState(false);
  const [customModId, setCustomModId] = useState("");
  const [packageName, setPackageName] = useState("com.example");
  const [version, setVersion] = useState("1.0.0");
  const [description, setDescription] = useState("A Hytale server mod");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [javaVersion, setJavaVersion] = useState("21");
  const [serverVersion, setServerVersion] = useState("*");
  const [includeExampleCommand, setIncludeExampleCommand] = useState(true);
  const [includeExampleEvent, setIncludeExampleEvent] = useState(true);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const modId = useCustomId ? customModId : generateModId(modName);
  const className = generateClassName(modName);
  const isPackageValid = validatePackageName(packageName);
  const entryPoint = `${packageName}.${className}`;

  // Handle download
  const handleGenerate = useCallback(async () => {
    if (!isPackageValid) {
      setError("Invalid package name. Use lowercase letters separated by dots.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config: ModConfig = {
        modName,
        modId,
        packageName,
        version,
        description,
        authorName: authorName || "Your Name",
        authorEmail: authorEmail || "your.email@example.com",
        website: website || "https://example.com",
        javaVersion,
        serverVersion,
        includeExampleCommand,
        includeExampleEvent,
      };

      const blob = await generateTemplate(config, "/hytale-template.zip");
      downloadBlob(blob, `${className}.zip`);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate template.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    modName, modId, packageName, version, description,
    authorName, authorEmail, website, javaVersion, serverVersion,
    includeExampleCommand, includeExampleEvent, className, isPackageValid,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="header">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-white font-semibold">Hytale Modding</span>
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
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Template mod generator</h1>
        <p className="text-[var(--text-muted)] mb-1">
          Generate a customised template mod project for Hytale.
        </p>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          For setup instructions, see the project README. This template is available under the{" "}
          <a href="https://creativecommons.org/publicdomain/zero/1.0/" className="link" target="_blank" rel="noopener noreferrer">
            CC0 license
          </a>.
        </p>

        {/* Form Card */}
        <div className="card p-6">
          {/* Mod Name */}
          <div className="form-group">
            <label htmlFor="modName" className="form-label">Mod Name:</label>
            <p className="form-hint mb-2">
              Choose a name for your new mod. The mod ID will be <code>{modId}</code>.{" "}
              <button type="button" className="link" onClick={() => setUseCustomId(!useCustomId)}>
                {useCustomId ? "Use default" : "Use custom id"}
              </button>
            </p>
            <input
              type="text"
              id="modName"
              className="form-input"
              style={{ maxWidth: '280px' }}
              value={modName}
              onChange={(e) => setModName(e.target.value)}
            />
          </div>

          {/* Custom Mod ID */}
          {useCustomId && (
            <div className="form-group">
              <label htmlFor="modId" className="form-label">Custom Mod ID:</label>
              <input
                type="text"
                id="modId"
                className="form-input"
                style={{ maxWidth: '280px' }}
                value={customModId}
                onChange={(e) => setCustomModId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="my_mod"
              />
            </div>
          )}

          <div className="divider" />

          {/* Package Name */}
          <div className="form-group">
            <label htmlFor="packageName" className="form-label">Package Name:</label>
            <p className="form-hint mb-2">
              Choose a unique package name for your mod. If unsure, use <code>name.{modId}</code>.
            </p>
            <input
              type="text"
              id="packageName"
              className="form-input"
              style={{ maxWidth: '280px' }}
              value={packageName}
              onChange={(e) => setPackageName(e.target.value.toLowerCase())}
            />
            {!isPackageValid && packageName && (
              <p className="text-red-600 text-sm mt-2">
                Must be lowercase letters/numbers separated by dots (e.g., com.example.mod)
              </p>
            )}
          </div>

          <div className="divider" />

          {/* Java Version */}
          <div className="form-group">
            <label htmlFor="javaVersion" className="form-label">Java Version:</label>
            <p className="form-hint mb-2">
              Select the Java version for development. Java 21 (LTS) is recommended.
            </p>
            <select
              id="javaVersion"
              className="form-select"
              style={{ maxWidth: '200px' }}
              value={javaVersion}
              onChange={(e) => setJavaVersion(e.target.value)}
            >
              <option value="21">Java 21 (LTS)</option>
              <option value="22">Java 22</option>
              <option value="23">Java 23</option>
              <option value="24">Java 24</option>
              <option value="25">Java 25</option>
            </select>
          </div>

          <div className="divider" />

          {/* Advanced Options */}
          <button
            type="button"
            className={`collapse-trigger ${showAdvanced ? 'open' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <ChevronDown open={showAdvanced} />
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-5">
              {/* Description */}
              <div className="form-group !mb-0">
                <label htmlFor="description" className="form-label">Description:</label>
                <textarea
                  id="description"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Author fields */}
              <div className="grid-2">
                <div className="form-group !mb-0">
                  <label htmlFor="authorName" className="form-label">Author Name:</label>
                  <input
                    type="text"
                    id="authorName"
                    className="form-input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div className="form-group !mb-0">
                  <label htmlFor="authorEmail" className="form-label">Author Email:</label>
                  <input
                    type="email"
                    id="authorEmail"
                    className="form-input"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="form-group !mb-0">
                <label htmlFor="website" className="form-label">Website:</label>
                <input
                  type="url"
                  id="website"
                  className="form-input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* Version */}
              <div className="form-group !mb-0">
                <label htmlFor="version" className="form-label">Mod Version:</label>
                <input
                  type="text"
                  id="version"
                  className="form-input"
                  style={{ maxWidth: '120px' }}
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>

              <div className="divider" />

              {/* Example code options */}
              <div>
                <p className="form-label mb-3">Include Example Code:</p>

                <label className="flex items-start gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={includeExampleCommand}
                    onChange={(e) => setIncludeExampleCommand(e.target.checked)}
                  />
                  <div>
                    <span className="font-medium">Example Command</span>
                    <p className="checkbox-desc">
                      A basic in-game command to get you started with the command API.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={includeExampleEvent}
                    onChange={(e) => setIncludeExampleEvent(e.target.checked)}
                  />
                  <div>
                    <span className="font-medium">Example Event Handler</span>
                    <p className="checkbox-desc">
                      A PlayerReadyEvent handler that welcomes players when they join.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="divider" />

          {/* Preview */}
          <div className="form-group !mb-0">
            <p className="form-label mb-2">Preview:</p>
            <div className="code-box text-sm">
              <div className="mb-2">
                <span className="path">Entry point:</span>{" "}
                <span className="file">{entryPoint}</span>
              </div>
              <div className="space-y-0.5">
                <div><span className="path">src/main/java/{packageName.replace(/\./g, '/')}/</span></div>
                <div className="pl-4"><span className="file">{className}.java</span></div>
                {includeExampleCommand && (
                  <>
                    <div className="pl-4"><span className="path">commands/</span></div>
                    <div className="pl-8"><span className="file-cmd">{className}Command.java</span></div>
                  </>
                )}
                {includeExampleEvent && (
                  <>
                    <div className="pl-4"><span className="path">events/</span></div>
                    <div className="pl-8"><span className="file-event">{className}Event.java</span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Error */}
          {error && (
            <div className="error-box mb-4">
              {error}
            </div>
          )}

          {/* Download Button */}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !isPackageValid}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              "Download Template (.ZIP)"
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          <p className="mb-2">
            This template is available under the{" "}
            <a href="https://creativecommons.org/publicdomain/zero/1.0/" className="link" target="_blank" rel="noopener noreferrer">
              CC0 License
            </a>.
          </p>
          <p className="text-xs opacity-70">
            NOT AN OFFICIAL HYTALE PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH HYPIXEL STUDIOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
