import JSZip from 'jszip';

export interface ModConfig {
    modName: string;
    modId: string;
    packageName: string;
    version: string;
    description: string;
    authorName: string;
    authorEmail: string;
    website: string;
    javaVersion: string;
    serverVersion: string;
    includeExampleCommand: boolean;
    includeExampleEvent: boolean;
}

// Convert mod name to a valid mod ID (lowercase, no spaces, alphanumeric + underscores)
export function generateModId(modName: string): string {
    return modName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Convert mod name to a valid class name (PascalCase, alphanumeric only)
export function generateClassName(modName: string): string {
    return modName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

// Validate package name (must be valid Java package)
export function validatePackageName(packageName: string): boolean {
    const javaPackageRegex = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;
    return javaPackageRegex.test(packageName);
}

// Generate the gradle.properties content
function generateGradleProperties(config: ModConfig): string {
    const className = generateClassName(config.modName);
    return `group=${config.packageName}
name=${className}
version=${config.version}
java_version=${config.javaVersion}
mod_description=${config.description}
website=${config.website}
server_version=${config.serverVersion}
game_build=latest
entry_point=${config.packageName}.${className}

# Hytale installation path
# By default, the build script will automatically detect your OS and use the standard Hytale installation path:
#   - Linux:   ~/.local/share/Hytale/install
#   - Windows: %APPDATA%\\Hytale\\install
#   - macOS:   ~/Library/Application Support/Hytale/install
# Uncomment and set this ONLY if your Hytale is installed in a custom location:
# hytaleHome=/custom/path/to/Hytale/install

patchline=release
`;
}

// Generate the settings.gradle content
function generateSettingsGradle(config: ModConfig): string {
    const className = generateClassName(config.modName);
    return `rootProject.name = '${className}'
`;
}

// Generate the main plugin class
function generateMainClass(config: ModConfig): string {
    const className = generateClassName(config.modName);
    const commandClassName = `${className}Command`;
    const eventClassName = `${className}Event`;

    const imports: string[] = [
        'import com.hypixel.hytale.server.core.plugin.JavaPlugin;',
        'import com.hypixel.hytale.server.core.plugin.JavaPluginInit;',
        '',
        'import javax.annotation.Nonnull;',
    ];

    if (config.includeExampleCommand) {
        imports.splice(1, 0, `import ${config.packageName}.commands.${commandClassName};`);
    }
    if (config.includeExampleEvent) {
        imports.splice(1, 0, `import ${config.packageName}.events.${eventClassName};`);
        imports.splice(1, 0, 'import com.hypixel.hytale.server.core.event.events.player.PlayerReadyEvent;');
    }

    const setupBody: string[] = [];
    if (config.includeExampleCommand) {
        setupBody.push(`        this.getCommandRegistry().registerCommand(new ${commandClassName}("${config.modId}", "A command for ${config.modName}"));`);
    }
    if (config.includeExampleEvent) {
        setupBody.push(`        this.getEventRegistry().registerGlobal(PlayerReadyEvent.class, ${eventClassName}::onPlayerReady);`);
    }
    if (setupBody.length === 0) {
        setupBody.push('        // Register your commands and events here');
    }

    return `package ${config.packageName};

${imports.join('\n')}

public class ${className} extends JavaPlugin {

    public ${className}(@Nonnull JavaPluginInit init) {
        super(init);
    }

    @Override
    protected void setup() {
${setupBody.join('\n')}
    }

    @Override
    protected void start() {
        super.start();
    }

    @Override
    protected void shutdown() {
        super.shutdown();
    }
}
`;
}

// Generate example command class
function generateCommandClass(config: ModConfig): string {
    const className = generateClassName(config.modName);
    const commandClassName = `${className}Command`;

    return `package ${config.packageName}.commands;

import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.command.system.CommandContext;
import com.hypixel.hytale.server.core.command.system.basecommands.CommandBase;

import javax.annotation.Nonnull;

public class ${commandClassName} extends CommandBase {

    public ${commandClassName}(String name, String description) {
        super(name, description);
    }

    @Override
    protected void executeSync(@Nonnull CommandContext context) {
        context.sendMessage(Message.raw("Hello from ${config.modName}!"));
    }
}
`;
}

// Generate example event class
function generateEventClass(config: ModConfig): string {
    const className = generateClassName(config.modName);
    const eventClassName = `${className}Event`;

    return `package ${config.packageName}.events;

import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.event.events.player.PlayerReadyEvent;

public class ${eventClassName} {

    public static void onPlayerReady(PlayerReadyEvent event) {
        Player player = event.getPlayer();
        player.sendMessage(Message.raw("Welcome to ${config.modName}!"));
    }

}
`;
}

// Generate manifest.json
function generateManifest(config: ModConfig): string {
    return JSON.stringify({
        Group: "${group}",
        Name: "${name}",
        Version: "${version}",
        Description: "${description}",
        Authors: [
            {
                Name: config.authorName,
                Email: config.authorEmail,
                Url: "${website}"
            }
        ],
        Website: "${website}",
        ServerVersion: "${server_version}",
        Dependencies: {},
        OptionalDependencies: {},
        DisabledByDefault: false,
        Main: "${entry_point}"
    }, null, 2);
}

// Generate .gitignore
function generateGitignore(): string {
    return `# Gradle
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar

# IDE
.idea/
*.iml
.eclipse/
.vscode/
*.launch

# Runtime
run/
logs/
mods/
config.json
bans.json
permissions.json
whitelist.json
universe/

# OS
.DS_Store
Thumbs.db

# Build outputs
*.jar
!gradle/wrapper/*.jar
`;
}

// Generate README.md
function generateReadme(config: ModConfig): string {
    const className = generateClassName(config.modName);
    return `# ${config.modName}

${config.description}

## Requirements

- Java ${config.javaVersion}+
- Hytale (installed via official launcher)
- Gradle (included via wrapper)

## Getting Started

### 1. Clone/Download this project

\`\`\`bash
cd ${className}
\`\`\`

### 2. Build the mod

\`\`\`bash
./gradlew build
\`\`\`

### 3. Run with Hytale Server

\`\`\`bash
./gradlew runServer
\`\`\`

### 4. Run with Hytale Client

\`\`\`bash
./gradlew runClient
\`\`\`

## IDE Setup

### IntelliJ IDEA
Open the project folder in IntelliJ IDEA. The IDE should automatically detect it as a Gradle project.

### VS Code
Run \`./gradlew vscode\` to generate VS Code launch configurations.

### Eclipse
Run \`./gradlew eclipse\` to generate Eclipse launch configurations.

## Project Structure

\`\`\`
${className}/
├── src/main/java/${config.packageName.replace(/\./g, '/')}/
│   ├── ${className}.java          # Main plugin class
${config.includeExampleCommand ? `│   └── commands/
│       └── ${className}Command.java  # Example command\n` : ''}${config.includeExampleEvent ? `│   └── events/
│       └── ${className}Event.java    # Example event handler\n` : ''}├── src/main/resources/
│   └── manifest.json              # Mod manifest
├── build.gradle                   # Build configuration
├── gradle.properties              # Mod properties
└── settings.gradle                # Project settings
\`\`\`

## Useful Gradle Tasks

- \`./gradlew build\` - Build the mod JAR
- \`./gradlew runServer\` - Start Hytale server with mod
- \`./gradlew runClient\` - Start Hytale client with mod
- \`./gradlew copyMod\` - Copy mod to Hytale mods folder
- \`./gradlew cleanMod\` - Remove mod from all locations
- \`./gradlew ide\` - Generate all IDE configurations

## License

This project is available under the CC0 License - feel free to use it however you like!

## Links

- Website: ${config.website}
- Hytale: [https://hytale.com](https://hytale.com)
`;
}

// Main function to generate the template ZIP
export async function generateTemplate(config: ModConfig, templateZipUrl: string): Promise<Blob> {
    // Fetch the base template from CDN
    const response = await fetch(templateZipUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const templateData = await response.arrayBuffer();
    const templateZip = await JSZip.loadAsync(templateData);

    // Create a new ZIP for the output
    const outputZip = new JSZip();
    const className = generateClassName(config.modName);
    const packagePath = config.packageName.replace(/\./g, '/');

    // Copy and transform files from the template
    const entries = Object.keys(templateZip.files);

    for (const entry of entries) {
        const file = templateZip.files[entry];

        // Skip directories, we'll create them as needed
        if (file.dir) continue;

        // Skip build artifacts, IDE files, and runtime files
        if (
            entry.includes('.gradle/') ||
            entry.includes('.idea/') ||
            entry.includes('.vscode/') ||
            entry.includes('.eclipse/') ||
            entry.includes('build/') ||
            entry.includes('run/') ||
            entry.includes('logs/') ||
            entry.includes('mods/') ||
            entry.includes('universe/') ||
            entry.endsWith('.jar') ||
            entry.endsWith('config.json') ||
            entry.endsWith('bans.json') ||
            entry.endsWith('permissions.json') ||
            entry.endsWith('whitelist.json')
        ) {
            continue;
        }

        // Handle specific files that need customization
        if (entry.endsWith('gradle.properties')) {
            outputZip.file('gradle.properties', generateGradleProperties(config));
        } else if (entry.endsWith('settings.gradle')) {
            outputZip.file('settings.gradle', generateSettingsGradle(config));
        } else if (entry.endsWith('.gitignore')) {
            outputZip.file('.gitignore', generateGitignore());
        } else if (entry.endsWith('manifest.json')) {
            outputZip.file(`src/main/resources/manifest.json`, generateManifest(config));
        } else if (entry.includes('ExamplePlugin.java')) {
            // Generate main class with new package path
            outputZip.file(`src/main/java/${packagePath}/${className}.java`, generateMainClass(config));
        } else if (entry.includes('ExampleCommand.java') && config.includeExampleCommand) {
            // Generate command class
            outputZip.file(`src/main/java/${packagePath}/commands/${className}Command.java`, generateCommandClass(config));
        } else if (entry.includes('ExampleEvent.java') && config.includeExampleEvent) {
            // Generate event class
            outputZip.file(`src/main/java/${packagePath}/events/${className}Event.java`, generateEventClass(config));
        } else if (entry.endsWith('build.gradle')) {
            // Copy build.gradle as-is (it uses gradle.properties variables)
            const content = await file.async('string');
            outputZip.file('build.gradle', content);
        } else if (entry.endsWith('gradlew') || entry.endsWith('gradlew.bat')) {
            // Copy gradle wrapper scripts
            const content = await file.async('uint8array');
            outputZip.file(entry.split('/').pop()!, content);
        } else if (entry.includes('gradle/wrapper/')) {
            // Copy gradle wrapper files
            const fileName = entry.split('/').slice(-2).join('/');
            const content = await file.async('uint8array');
            outputZip.file(`gradle/wrapper/${fileName.split('/').pop()}`, content);
        } else if (entry.endsWith('README.md')) {
            // Generate new README
            outputZip.file('README.md', generateReadme(config));
        }
    }

    // Ensure we have the main class even if template structure differs
    if (!outputZip.files[`src/main/java/${packagePath}/${className}.java`]) {
        outputZip.file(`src/main/java/${packagePath}/${className}.java`, generateMainClass(config));
    }

    // Ensure manifest exists
    if (!outputZip.files['src/main/resources/manifest.json']) {
        outputZip.file('src/main/resources/manifest.json', generateManifest(config));
    }

    // Generate the ZIP blob
    return await outputZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });
}

// Alternative: Generate template without fetching from CDN (fully client-side)
export async function generateTemplateFromScratch(config: ModConfig): Promise<Blob> {
    const zip = new JSZip();
    const className = generateClassName(config.modName);
    const packagePath = config.packageName.replace(/\./g, '/');

    // Add gradle.properties
    zip.file('gradle.properties', generateGradleProperties(config));

    // Add settings.gradle
    zip.file('settings.gradle', generateSettingsGradle(config));

    // Add .gitignore
    zip.file('.gitignore', generateGitignore());

    // Add README.md
    zip.file('README.md', generateReadme(config));

    // Add manifest.json
    zip.file('src/main/resources/manifest.json', generateManifest(config));

    // Add main class
    zip.file(`src/main/java/${packagePath}/${className}.java`, generateMainClass(config));

    // Add example command if selected
    if (config.includeExampleCommand) {
        zip.file(`src/main/java/${packagePath}/commands/${className}Command.java`, generateCommandClass(config));
    }

    // Add example event if selected
    if (config.includeExampleEvent) {
        zip.file(`src/main/java/${packagePath}/events/${className}Event.java`, generateEventClass(config));
    }

    // Add build.gradle (we'll need to embed this or fetch it)
    zip.file('build.gradle', BUILD_GRADLE_TEMPLATE);

    // Add gradle wrapper files
    zip.file('gradlew', GRADLEW_SCRIPT, { unixPermissions: "755" });
    zip.file('gradlew.bat', GRADLEW_BAT_SCRIPT);
    zip.file('gradle/wrapper/gradle-wrapper.properties', GRADLE_WRAPPER_PROPERTIES);

    // Generate the ZIP blob
    return await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
        platform: 'UNIX',
        mimeType: 'application/zip'
    });
}

// Embedded build.gradle template
const BUILD_GRADLE_TEMPLATE = `plugins {
    id 'java'
    id 'maven-publish'
    id 'org.jetbrains.gradle.plugin.idea-ext' version '1.3'
}

java {
    toolchain.languageVersion = JavaLanguageVersion.of(java_version)
    withSourcesJar()
    withJavadocJar()
}

// Configure javadoc and sources JARs to output to build/docs instead of build/libs
tasks.named('sourcesJar') {
    destinationDirectory.set(file("\${project.layout.buildDirectory.asFile.get()}/docs"))
}
tasks.named('javadocJar') {
    destinationDirectory.set(file("\${project.layout.buildDirectory.asFile.get()}/docs"))
}

repositories {
    mavenCentral()
}

// Import for OS detection
import org.gradle.nativeplatform.platform.internal.DefaultNativePlatform

// Get current OS
def os = DefaultNativePlatform.currentOperatingSystem

// Determine base Hytale installation directory
def getHytaleBaseDir() {
    // If hytaleHome is explicitly set in gradle.properties and it's an absolute path, use it
    if (project.hasProperty('hytaleHome') && hytaleHome != null && !hytaleHome.startsWith('\$')) {
        return hytaleHome
    }

    // Otherwise, use OS defaults
    def currentOs = DefaultNativePlatform.currentOperatingSystem
    def userHome = System.properties['user.home']

    if (currentOs.isLinux()) {
        // Standard Linux: ~/.local/share/Hytale/install
        return new File(userHome, ".local/share/Hytale/install").absolutePath
    } else if (currentOs.isWindows()) {
        // Windows: %APPDATA%\\Hytale\\install
        def appData = System.getenv('APPDATA')
        return new File(appData, "Hytale\\\\install").absolutePath
    } else if (currentOs.isMacOsX()) {
        // macOS: ~/Library/Application Support/Hytale/install
        return new File(userHome, "Library/Application Support/Hytale/install").absolutePath
    } else {
        throw new GradleException("Unsupported operating system: " + currentOs.displayName)
    }
}

def hytaleBaseDir = getHytaleBaseDir()
def hytaleServerPath = hytaleBaseDir + "/release/package/game/" + game_build + "/Server/HytaleServer.jar"
def assetsPath = hytaleBaseDir + "/" + patchline + "/package/game/latest/Assets.zip"

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    implementation files(hytaleServerPath)
}

test {
    useJUnitPlatform()
}

processResources {
    def expandProps = [
            'name'         : project.name,
            'version'      : project.version,
            'group'        : project.group,
            'description'  : mod_description,
            'website'      : website,
            'server_version': server_version,
            'entry_point'  : entry_point
    ]
    filesMatching('manifest.json') {
        expand expandProps
    }
    inputs.properties(expandProps)
}

// Task to copy the built mod JAR to the Hytale mods directory
task copyMod(type: Copy) {
    group = 'Hytale'
    description = 'Copies the built mod JAR to the Hytale mods directory'
    dependsOn jar
    from jar.archiveFile
    into file("\${hytaleBaseDir}/mods")
    doFirst {
        logger.lifecycle("Copying mod to: \${hytaleBaseDir}/mods/")
    }
}

// Task to clean/remove the mod from the Hytale mods directories
task cleanMod(type: Delete) {
    group = 'Hytale'
    description = 'Removes the built mod JAR from Hytale mods directories'

    def systemModsDir = file("\${hytaleBaseDir}/mods")
    def hytaleDataDir = file("\${hytaleBaseDir}/..").getCanonicalFile()
    def userDataModsDir = file("\${hytaleDataDir}/UserData/Mods")
    def runModsDir = file("\$projectDir/run/mods")

    doFirst {
        // Remove from system mods directory
        def systemMod = file("\${systemModsDir}/\${project.name}-\${version}.jar")
        if (systemMod.exists()) {
            delete systemMod
            logger.lifecycle("Removed mod from system mods: \${systemMod}")
        }

        // Remove from UserData/Mods
        def userDataMod = file("\${userDataModsDir}/\${project.name}-\${version}.jar")
        if (userDataMod.exists()) {
            delete userDataMod
            logger.lifecycle("Removed mod from UserData/Mods: \${userDataMod}")
        }

        // Remove from run/mods
        def runMod = file("\${runModsDir}/\${project.name}-\${version}.jar")
        if (runMod.exists()) {
            delete runMod
            logger.lifecycle("Removed mod from run/mods: \${runMod}")
        }
    }
}

// Task to setup the run directory with mods
task setupRunDir {
    group = 'Hytale'
    description = 'Sets up the run directory with mods and assets'
    dependsOn jar

    def runDir = file("\$projectDir/run")
    def runModsDir = file("\$projectDir/run/mods")
    def systemModsDir = file("\${hytaleBaseDir}/mods")
    // UserData is one level up from the install directory
    def hytaleDataDir = file("\${hytaleBaseDir}/..").getCanonicalFile()
    def userDataModsDir = file("\${hytaleDataDir}/UserData/Mods")

    inputs.dir 'build/libs'
    inputs.dir systemModsDir
    outputs.dir runModsDir
    outputs.dir userDataModsDir

    doLast {
        // Create run directory structure for server
        if (!runDir.exists()) {
            runDir.mkdirs()
        }
        if (!runModsDir.exists()) {
            runModsDir.mkdirs()
        }

        // Copy our mod to run/mods for server
        def ourMod = file("build/libs/\${project.name}-\${version}.jar")
        if (ourMod.exists()) {
            copy {
                from ourMod
                into runModsDir
            }
            logger.lifecycle("Copied mod to run directory: \${ourMod.name}")
        }

        // Copy user-installed mods from system mods directory (if it exists)
        if (systemModsDir.exists()) {
            copy {
                from systemModsDir
                into runModsDir
                exclude '*.jar' // Exclude our mod if already there (avoid duplicates)
                include '*.jar'
            }
            logger.lifecycle("Copied user mods from system directory")
        }

        // Copy our mod to UserData/Mods for client testing
        if (!userDataModsDir.exists()) {
            userDataModsDir.mkdirs()
        }
        copy {
            from ourMod
            into userDataModsDir
        }
        logger.lifecycle("Copied mod to UserData/Mods for client testing: \${userDataModsDir}")
    }
}

// Task to download/copy Assets.zip locally for offline development
task downloadAssets(type: Copy) {
    group = 'Hytale'
    description = 'Copies Assets.zip locally for offline development'
    from assetsPath
    into file("\$projectDir/run")
    doFirst {
        logger.lifecycle("Copying Assets.zip to: \${projectDir}/run/")
    }
}

// Task to run the Hytale server with the mod loaded
task runServer(type: JavaExec) {
    group = 'Hytale'
    description = 'Starts the Hytale server with the mod loaded for testing'
    dependsOn jar, setupRunDir

    mainClass = 'com.hypixel.hytale.Main'
    classpath = files(hytaleServerPath)

    def runDir = file("\$projectDir/run")
    def runModsDir = file("\$projectDir/run/mods")
    workingDir = runDir
    standardInput = System.in

    doFirst {
        logger.lifecycle("Starting Hytale server...")
        logger.lifecycle("Working directory: \${runDir}")
        logger.lifecycle("Mods directory: \${runModsDir}")
        logger.lifecycle("OS: \${os.displayName}")
        logger.lifecycle("Hytale installation: \${hytaleBaseDir}")
    }

    args = [
        "--allow-op",
        "--disable-sentry",
        "--assets=\${assetsPath}",
        "--mods=\${runModsDir.absolutePath}",
        "--auth-mode=insecure"
    ]

    jvmArgs = ["-Xmx2G", "-Xms1G"]
}

// Task to run the Hytale client with the mod loaded
task runClient(type: Exec) {
    group = 'Hytale'
    description = 'Starts the Hytale client with the mod loaded for testing'
    dependsOn jar, setupRunDir

    def clientPath = file("\${hytaleBaseDir}/release/package/game/\${game_build}/Client/HytaleClient")
    def hytaleDataDir = file("\${hytaleBaseDir}/..").getCanonicalFile()
    def userDataDir = file("\${hytaleDataDir}/UserData")

    doFirst {
        if (!clientPath.exists()) {
            throw new GradleException("HytaleClient not found at: \${clientPath}")
        }
        logger.lifecycle("Starting Hytale client...")
        logger.lifecycle("User data directory: \${userDataDir}")
        logger.lifecycle("Client executable: \${clientPath}")
        logger.lifecycle("Mod installed to: \${userDataDir}/Mods/")
        logger.lifecycle("INFO: Using official UserData for authentication")
        logger.lifecycle("INFO: Your mod has been copied to UserData/Mods/")
    }

    // Client uses official directories - mod is in UserData/Mods
    def clientArgs = [
        "--assets-path=\${assetsPath}"
    ]

    if (os.isWindows()) {
        commandLine 'cmd', '/c', clientPath, *clientArgs
    } else {
        commandLine clientPath, *clientArgs
    }
}

// ============================================================================
// IDE Run Configuration Generation
// ============================================================================

// IntelliJ IDEA run configuration
idea.project.settings.runConfigurations {
    'HytaleServer'(org.jetbrains.gradle.ext.Application) {
        mainClass = 'com.hypixel.hytale.Main'
        moduleName = project.name + '.main'
        programParameters = "--allow-op --disable-sentry --assets=\${assetsPath} --mods=\${file('\$projectDir/run/mods').absolutePath} --auth-mode=insecure"
        workingDirectory = file("\$projectDir/run").absolutePath
        jvmArgs = ["-Xmx2G", "-Xms1G"]

        // Set before launch tasks
        beforeRun {
            build
        }
    }
}

// VSCode launch configuration generation
task vscode {
    group = 'IDE'
    description = 'Generates .vscode/launch.json and tasks.json for VSCode debugging'

    def vscodeDir = file("\$projectDir/.vscode")
    def launchJson = file("\$vscodeDir/launch.json")
    def tasksJson = file("\$vscodeDir/tasks.json")

    inputs.property 'projectName', project.name
    inputs.property 'projectDir', projectDir
    inputs.property 'hytaleBaseDir', hytaleBaseDir
    outputs.file launchJson
    outputs.file tasksJson

    doLast {
        if (!vscodeDir.exists()) {
            vscodeDir.mkdirs()
        }

        // Generate launch.json
        def serverJar = file("\${hytaleBaseDir}/release/package/game/\${game_build}/Server/HytaleServer.jar").absolutePath
        def runDir = file("\$projectDir/run").absolutePath
        def modsPath = file("\$projectDir/run/mods").absolutePath
        def assetsPathStr = assetsPath.toString()

        def launchConfig = [
            version: "0.2.0",
            configurations: [
                [
                    type: "java",
                    name: "runServer Debug",
                    request: "launch",
                    mainClass: "com.hypixel.hytale.Main",
                    workingDirectory: runDir,
                    classPaths: [serverJar],
                    args: [
                        "--allow-op",
                        "--disable-sentry",
                        "--assets=\${assetsPathStr}",
                        "--mods=\${modsPath}",
                        "--auth-mode=insecure"
                    ],
                    vmArgs: "-Xmx2G -Xms1G",
                    preLaunchTask: "gradle: build"
                ],
                [
                    type: "java",
                    name: "runServer Release",
                    request: "launch",
                    mainClass: "com.hypixel.hytale.Main",
                    workingDirectory: runDir,
                    classPaths: [serverJar],
                    args: [
                        "--allow-op",
                        "--disable-sentry",
                        "--assets=\${assetsPathStr}",
                        "--mods=\${modsPath}",
                        "--auth-mode=insecure"
                    ],
                    vmArgs: "-Xmx2G -Xms1G",
                    preLaunchTask: "gradle: build"
                ]
            ]
        ]

        launchJson.text = groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(launchConfig))
        logger.lifecycle("Generated VSCode launch configuration: \${launchJson}")

        // Generate tasks.json manually to avoid empty arrays
        def tasksJsonContent = """{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "gradle: build",
            "type": "shell",
            "command": "./gradlew build",
            "options": {
                "cwd": "\${projectDir.absolutePath.replace('\\\\', '/')}"
            },
            "windows": {
                "command": "gradlew.bat",
                "args": ["build"]
            },
            "group": "build",
            "detail": "Builds the project with Gradle",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "clear": true
            }
        },
        {
            "label": "gradle: copyMod",
            "type": "shell",
            "command": "./gradlew copyMod",
            "options": {
                "cwd": "\${projectDir.absolutePath.replace('\\\\', '/')}"
            },
            "windows": {
                "command": "gradlew.bat",
                "args": ["copyMod"]
            },
            "group": "build",
            "detail": "Copies the built mod to Hytale mods directory",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "clear": true
            }
        },
        {
            "label": "gradle: runServer",
            "type": "shell",
            "command": "./gradlew runServer",
            "options": {
                "cwd": "\${projectDir.absolutePath.replace('\\\\', '/')}"
            },
            "windows": {
                "command": "gradlew.bat",
                "args": ["runServer"]
            },
            "group": "build",
            "detail": "Starts the Hytale server with the mod loaded",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "clear": false
            }
        },
        {
            "label": "gradle: runClient",
            "type": "shell",
            "command": "./gradlew runClient",
            "options": {
                "cwd": "\${projectDir.absolutePath.replace('\\\\', '/')}"
            },
            "windows": {
                "command": "gradlew.bat",
                "args": ["runClient"]
            },
            "group": "build",
            "detail": "Starts the Hytale client with the mod loaded",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "clear": false
            }
        }
    ]
}"""

        tasksJson.text = tasksJsonContent
        logger.lifecycle("Generated VSCode tasks configuration: \${tasksJson}")

        // Generate extensions.json to recommend required extensions
        def extensionsJson = file("\$vscodeDir/extensions.json")
        def extensionsConfig = [
            recommendations: [
                "vscjava.vscode-java-pack",
                "redhat.java",
                "vscjava.vscode-gradle"
            ]
        ]
        extensionsJson.text = groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(extensionsConfig))
        logger.lifecycle("Generated VSCode extensions recommendations: \${extensionsJson}")
    }
}

// Eclipse launch configuration generation
task eclipse {
    group = 'IDE'
    description = 'Generates Eclipse launch configuration for Hytale Server'

    def eclipseLaunchDir = file("\$projectDir/.eclipse/launch")
    def launchFile = file("\$eclipseLaunchDir/HytaleServer.launch")

    inputs.property 'projectName', project.name
    inputs.property 'projectDir', projectDir
    inputs.property 'hytaleBaseDir', hytaleBaseDir
    outputs.file launchFile

    doLast {
        if (!eclipseLaunchDir.exists()) {
            eclipseLaunchDir.mkdirs()
        }

        def serverJar = file("\${hytaleBaseDir}/release/package/game/\${game_build}/Server/HytaleServer.jar").absolutePath.replace('\\\\', '/')
        def runDir = file("\$projectDir/run").absolutePath
        def assetsPathStr = assetsPath.toString()
        def modsPathStr = file("\$projectDir/run/mods").absolutePath

        def launchConfig = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<launchConfiguration type="org.eclipse.jdt.launching.localJavaApplication">
    <listAttribute key="org.eclipse.debug.core.MAPPED_RESOURCE_PATHS">
        <listEntry value="/\${project.name}"/>
    </listAttribute>
    <listAttribute key="org.eclipse.debug.core.MAPPED_RESOURCE_TYPES">
        <listEntry value="4"/>
    </listAttribute>
    <booleanAttribute key="org.eclipse.debug.core.ATTR_FORCE_CONSOLE_PORT" value="false"/>
    <stringAttribute key="org.eclipse.jdt.launching.MAIN_TYPE" value="com.hypixel.hytale.Main"/>
    <stringAttribute key="org.eclipse.jdt.launching.PROGRAM_ARGUMENTS" value="--allow-op --disable-sentry --assets=\${assetsPathStr} --mods=\${modsPathStr} --auth-mode=insecure"/>
    <stringAttribute key="org.eclipse.jdt.launching.VM_ARGUMENTS" value="-Xmx2G -Xms1G"/>
    <stringAttribute key="org.eclipse.jdt.launching.WORKING_DIRECTORY" value="\${runDir}"/>
</launchConfiguration>
"""

        launchFile.text = launchConfig
        logger.lifecycle("Generated Eclipse launch configuration: \${launchFile}")
    }
}

// Task to generate all IDE configurations
task ide {
    group = 'IDE'
    description = 'Generates run configurations for all supported IDEs (VSCode, Eclipse, IntelliJ)'
    dependsOn vscode, eclipse
}

// Publishing configuration
publishing {
    publications {
        mavenJava(MavenPublication) {
            artifactId = project.name
            from components.java

            pom {
                name = project.name
                description = mod_description
                url = website

                developers {
                    developer {
                        id = 'hytalemodding'
                        name = 'Your Name'
                    }
                }
            }
        }
    }
    repositories {
        mavenLocal()
    }
}
`;

// Gradle wrapper script for Unix
const GRADLEW_SCRIPT = `#!/bin/sh

#
# Copyright © 2015-2021 the original authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

##############################################################################
#
#   Gradle start up script for POSIX generated by Gradle.
#
##############################################################################

# Attempt to set APP_HOME
# Resolve links: \$0 may be a link
app_path=\$0

# Need this for daisy-chained symlinks.
while
    APP_HOME=\${app_path%"\${app_path##*/}"}  # leaves a trailing /; empty if no leading path
    [ -h "\$app_path" ]
do
    ls=\$( ls -ld "\$app_path" )
    link=\${ls#*' -> '}
    case \$link in             #(
      /*)   app_path=\$link ;; #(
      *)    app_path=\$APP_HOME\$link ;;
    esac
done

APP_HOME=\$( cd "\${APP_HOME:-./}" && pwd -P ) || exit

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD=maximum

warn () {
    echo "\$*"
} >&2

die () {
    echo
    echo "\$*"
    echo
    exit 1
} >&2

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "\$( uname )" in                #(
  CYGWIN* )         cygwin=true  ;; #(
  Darwin* )         darwin=true  ;; #(
  MSYS* | MINGW* )  msys=true    ;; #(
  NONSTOP* )        nonstop=true ;;
esac

CLASSPATH=\$APP_HOME/gradle/wrapper/gradle-wrapper.jar

# Determine the Java command to use to start the JVM.
if [ -n "\$JAVA_HOME" ] ; then
    if [ -x "\$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD=\$JAVA_HOME/jre/sh/java
    else
        JAVACMD=\$JAVA_HOME/bin/java
    fi
    if [ ! -x "\$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: \$JAVA_HOME"
    fi
else
    JAVACMD=java
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH."
fi

# Increase the maximum file descriptors if we can.
if ! "\$cygwin" && ! "\$darwin" && ! "\$nonstop" ; then
    case \$MAX_FD in #(
      max*)
        MAX_FD=\$( ulimit -H -n ) ||
            warn "Could not query maximum file descriptor limit"
    esac
    case \$MAX_FD in  #(
      '' | soft) :;; #(
      *)
        ulimit -n "\$MAX_FD" ||
            warn "Could not set maximum file descriptor limit to \$MAX_FD"
    esac
fi

# Collect all arguments for the java command, stacking in reverse order:
#   * args from the command line
#   * the main class name
#   * -classpath
#   * -D...appname settings
#   * --module-path (only if needed)
#   * DEFAULT_JVM_OPTS, JAVA_OPTS, and GRADLE_OPTS environment variables.

# For Cygwin or MSYS, switch paths to Windows format before running java
if "\$cygwin" || "\$msys" ; then
    APP_HOME=\$( cygpath --path --mixed "\$APP_HOME" )
    CLASSPATH=\$( cygpath --path --mixed "\$CLASSPATH" )
    JAVACMD=\$( cygpath --unix "\$JAVACMD" )
fi

exec "\$JAVACMD" "\$@" -classpath "\$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "\$@"
`;

// Gradle wrapper script for Windows
const GRADLEW_BAT_SCRIPT = `@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar

@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem having the window exist as soon as the error code is consumed.
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%GRADLE_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
`;

// Gradle wrapper properties
const GRADLE_WRAPPER_PROPERTIES = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
