/**
 * Environment Configuration
 * Loads credentials from .env file
 * NEVER commit .env file to git - it contains sensitive data!
 * 
 * Usage:
 *   import config from './services/config';
 *   console.log(config.api.baseURL);
 *   console.log(config.firebase.projectId);
 *   console.log(config.postgres.host);
 */

const config = {
  // ============================================
  // Backend API Configuration (REST)
  // ============================================
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    endpoint: process.env.REACT_APP_API_ENDPOINT || '/api/wildlife',
    timeout: 30000,
  },

  // ============================================
  // PostgreSQL Direct Connection
  // ============================================
  postgres: {
    host: process.env.REACT_APP_POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.REACT_APP_POSTGRES_PORT || '5432'),
    database: process.env.REACT_APP_POSTGRES_DB || 'dw',
    user: process.env.REACT_APP_POSTGRES_USER || 'postgres',
    password: process.env.REACT_APP_POSTGRES_PASSWORD || '',
  },

  // ============================================
  // Firebase Cloud Configuration
  // ============================================
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  },

  // ============================================
  // Storage Mode
  // ============================================
  storageMode: (process.env.REACT_APP_STORAGE_MODE || 'local') as 'local' | 'firebase',
};

// Validate required configurations based on storage mode
if (config.storageMode === 'firebase' && !config.firebase.projectId) {
  console.warn('⚠️  Firebase mode selected but projectId not configured in .env');
}

if (!config.api.baseURL) {
  console.warn('⚠️  API baseURL not configured in .env');
}

export default config;
