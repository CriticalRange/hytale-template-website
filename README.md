# Hytale Mod Template Generator

A web-based template generator for Hytale mods, inspired by [Fabric MC's template generator](https://fabricmc.net/develop/template/).

Generate customized Hytale mod projects in seconds with your own mod name, package structure, and optional example code.

## Features

- **Instant Generation**: Create a complete mod template with one click
- **Customizable**: Set your mod name, package name, version, and more
- **Example Code**: Optionally include example commands and event handlers
- **Dark/Light Theme**: Automatically detects system theme preference
- **Client-Side**: All generation happens in the browser - no server required

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/hytale-template-website.git
cd hytale-template-website

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Template Structure

The generated mod template includes:

```
YourMod/
├── src/main/java/your/package/
│   ├── YourMod.java              # Main plugin class
│   ├── commands/
│   │   └── YourModCommand.java   # Example command (optional)
│   └── events/
│       └── YourModEvent.java     # Example event handler (optional)
├── src/main/resources/
│   └── manifest.json             # Mod manifest
├── build.gradle                  # Gradle build configuration
├── gradle.properties             # Mod properties
├── settings.gradle               # Project settings
├── gradlew / gradlew.bat         # Gradle wrapper
└── README.md                     # Documentation
```

## CDN Template

The base template is stored in `/public/hytale-template.zip`. To update the template:

1. Create your template mod project
2. Remove build artifacts (`.gradle/`, `build/`, `.idea/`, etc.)
3. Zip the project
4. Replace `/public/hytale-template.zip`

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [TailwindCSS 4](https://tailwindcss.com/) - Styling
- [JSZip](https://stuk.github.io/jszip/) - Client-side ZIP generation
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

This project is available under the [CC0 License](https://creativecommons.org/publicdomain/zero/1.0/) - feel free to use it however you like!

---

**NOT AN OFFICIAL HYTALE PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH HYPIXEL STUDIOS.**
