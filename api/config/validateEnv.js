// Environment Variable Validation on Startup
const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("\n❌ FATAL: Required environment variables are missing:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error(
    "\n💡 Please check your .env file and ensure all required variables are set.\n",
  );
  process.exit(1);
}

// Optional but recommended env vars
const recommendedEnvVars = {
  ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000",
  PORT: "5000",
  NODE_ENV: "development",
};

Object.entries(recommendedEnvVars).forEach(([varName, defaultValue]) => {
  if (!process.env[varName]) {
    console.warn(`⚠️  ${varName} not set, using default: ${defaultValue}`);
  }
});

console.log("✅ Environment validation passed\n");

module.exports = { requiredEnvVars, recommendedEnvVars };
