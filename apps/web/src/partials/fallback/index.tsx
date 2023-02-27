// ERROR FALLBACKS
// TODO: THESE CAN BE CUSTOMIZED TO FIT ERROR REPORTING NEEDS
// Error fallbacks are rendered when error occurs in their child components
export * from "./root.error"; // Root Error UI
export * from "./home.error"; // Home Error UI
export * from "./project.error"; // Project Error UI
export * from "./settings.error"; // Settings Error UI
export * from "./signin.error"; // Sign In Error UI
export * from "./signup.error"; // SignUp Error UI
export * from "./admin.error"; // Admin Panel UI

// SUSPENSE FALLBACKS
// TODO: THESE CAN BE CUSTOMIZED TO FIT LOADING STATE NEEDS
// Suspense fallbacks are rendered while data is loading in child components
export * from "./root.suspense"; // Root Suspense UI
export * from "./home.suspense"; // Home Suspense UI
export * from "./project.suspense"; // Project Suspense UI
export * from "./settings.suspense"; // Settings Suspense UI
export * from "./signin.suspense"; // SignIn Suspense UI
export * from "./signup.suspense"; // SignUp Suspense UI
export * from "./admin.suspense"; // Admin Panel Suspense UI
