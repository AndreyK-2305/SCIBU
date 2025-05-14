// Build script that skips type checking for production
import { execSync } from "child_process";
import { writeFileSync } from "fs";

// Set environment variable to skip type checking
process.env.VITE_SKIP_TS_CHECK = "true";

console.log("🚀 Starting production build...");
console.log("🔍 TypeScript type checking is DISABLED for faster builds");

try {
  // Run Vite build
  execSync("vite build", { stdio: "inherit" });
  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
