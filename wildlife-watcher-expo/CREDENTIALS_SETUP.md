# 🔐 Credentials & Configuration Guide

This document explains how to manage sensitive credentials (PostgreSQL, Firebase) securely in this project.

## ⚠️ CRITICAL: Never Commit Credentials

**NEVER** commit `.env` file to Git! It contains sensitive passwords and API keys.

The `.env` file is already in `.gitignore` - make sure it stays that way.

## 📁 Environment Files

### `.env` (Local - Do NOT Commit)
Contains your actual credentials. Example:
```env
REACT_APP_API_URL=http://3.16.128.82:5000
REACT_APP_POSTGRES_HOST=3.16.128.82
REACT_APP_POSTGRES_USER=conabio
REACT_APP_POSTGRES_PASSWORD=your_actual_password
REACT_APP_FIREBASE_API_KEY=AIzaSyBlfx4ygqLfUxoB0od14fJ109mW8-SipO4
```

### `.env.example` (Shared - Template Only)
Template showing required variables (no actual values). Commit this to Git.

## 🔧 Setup Instructions

### 1. Create Your `.env` File

Copy the example:
```bash
cp .env.example .env
```

### 2. Update `.env` with Your Credentials

Edit `.env` and fill in your actual values:

```env
# ============================================
# PostgreSQL Backend Credentials
# ============================================
REACT_APP_API_URL=http://3.16.128.82:5000
REACT_APP_API_ENDPOINT=/api/wildlife

# PostgreSQL Connection
REACT_APP_POSTGRES_HOST=3.16.128.82
REACT_APP_POSTGRES_PORT=5432
REACT_APP_POSTGRES_DB=dw
REACT_APP_POSTGRES_USER=conabio
REACT_APP_POSTGRES_PASSWORD=your_password_here

# ============================================
# Firebase Configuration (Cloud Copy)
# ============================================
REACT_APP_FIREBASE_API_KEY=AIzaSyBlfx4ygqLfUxoB0od14fJ109mW8-SipO4
REACT_APP_FIREBASE_AUTH_DOMAIN=hack-te-clientside.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hack-te-clientside
REACT_APP_FIREBASE_STORAGE_BUCKET=hack-te-clientside.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=803496601000
REACT_APP_FIREBASE_APP_ID=1:803496601000:ios:59316a1658270e0412e99d

# ============================================
# Storage Mode
# ============================================
# "local" = Device storage only (AsyncStorage)
# "firebase" = Cloud storage (Firestore)
REACT_APP_STORAGE_MODE=local
```

## 📊 Your Credentials Breakdown

### PostgreSQL Credentials
```
Host:     3.16.128.82
Port:     5432
Database: dw
User:     conabio
Password: [your_password]
```

### Firebase Credentials (Cloud Backup)
```
Project ID: hack-te-clientside
API Key: AIzaSyBlfx4ygqLfUxoB0od14fJ109mW8-SipO4
Auth Domain: hack-te-clientside.firebaseapp.com
...
```

## 🔄 Storage Modes

### Local Mode (Default)
- Data stored on device using **AsyncStorage**
- Synced to PostgreSQL backend when online
- Good for: Offline-first, privacy-focused
- Set: `REACT_APP_STORAGE_MODE=local`

### Firebase Mode
- Data stored in **Firebase Firestore** (Cloud)
- Synced automatically
- Good for: Real-time sync, multi-device
- Set: `REACT_APP_STORAGE_MODE=firebase`

## 📝 How to Use in Code

### Load Configuration
```typescript
import config from './services/config';

// API credentials
console.log(config.api.baseURL);        // "http://3.16.128.82:5000"
console.log(config.api.endpoint);       // "/api/wildlife"

// PostgreSQL credentials
console.log(config.postgres.host);      // "3.16.128.82"
console.log(config.postgres.user);      // "conabio"

// Firebase credentials
console.log(config.firebase.projectId);  // "hack-te-clientside"

// Storage mode
console.log(config.storageMode);        // "local" or "firebase"
```

### Use in Sync Service
```typescript
import config from './services/config';
import syncService from './services/syncService';

// Configure sync service with credentials
syncService.setConfig({
  baseURL: config.api.baseURL,
  endpoint: config.api.endpoint,
  timeout: config.api.timeout,
});
```

### Use in Firebase
```typescript
import config from './services/config';
import { initializeApp } from 'firebase/app';

const app = initializeApp(config.firebase);
```

## 🛡️ Security Best Practices

1. ✅ **Never commit `.env`** - it's in `.gitignore`
2. ✅ **Use environment variables** - don't hardcode credentials
3. ✅ **Rotate passwords** - especially for shared databases
4. ✅ **Share credentials securely** - use password manager, not email
5. ✅ **Different credentials per environment**:
   - Development: test database
   - Production: separate database
6. ✅ **Use `.env.example`** - commit this template instead

## 🚨 If Credentials Are Compromised

1. **Stop using immediately**
2. **Change PostgreSQL password** on the server
3. **Regenerate Firebase API keys** in Firebase Console
4. **Update `.env` with new credentials**
5. **Notify team members**

## 📦 Project Structure

```
wildlife-watcher-mobile/
├── .env                    # ❌ DO NOT COMMIT (contains passwords)
├── .env.example            # ✅ Commit this (template only)
├── .gitignore              # ✅ Ensures .env is ignored
├── services/
│   ├── config.ts           # ✅ Loads from .env
│   ├── firebase.js         # ✅ Uses config
│   ├── syncService.ts      # ✅ Uses config
│   └── localStorageService.ts
└── src/
    └── screens/
        └── Data.tsx        # ✅ Uses config
```

## 🔍 Verify Configuration

Check if credentials are loaded correctly:

```bash
# In your React app code, add temporary logging:
import config from './services/config';

console.log('API URL:', config.api.baseURL);
console.log('Firebase Project:', config.firebase.projectId);
console.log('Storage Mode:', config.storageMode);
console.log('PostgreSQL Host:', config.postgres.host);
```

## ✅ Checklist

- [ ] Created `.env` file from `.env.example`
- [ ] Filled in PostgreSQL credentials
- [ ] Filled in Firebase credentials  
- [ ] Set `REACT_APP_STORAGE_MODE` to desired value
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested app startup (check console logs)
- [ ] Verified credentials are being loaded
- [ ] Never committed `.env` to Git

## 📞 Troubleshooting

### "Firebase not initialized - missing configuration"
- Check `.env` has all Firebase variables
- Verify `REACT_APP_STORAGE_MODE` is set
- Restart app

### "API baseURL not configured"
- Check `.env` has `REACT_APP_API_URL`
- Verify it's correct format: `http://host:port`

### "PostgreSQL connection failed"
- Verify host is reachable: `ping 3.16.128.82`
- Check port: `5432` (default PostgreSQL)
- Verify credentials in `.env`
- Ensure database exists on server

### Credentials not loading
- Make sure `.env` is in root directory
- Restart dev server: `npm start`
- Clear cache: `npm start -- --reset-cache`

## 📚 Related Files

- `services/config.ts` - Configuration loader
- `services/firebase.js` - Firebase initialization
- `services/syncService.ts` - API sync with credentials
- `src/screens/Data.tsx` - Uses config for sync

---

**Remember**: Credentials are secrets. Treat `.env` like your password - don't share it, don't commit it, keep it safe! 🔒
