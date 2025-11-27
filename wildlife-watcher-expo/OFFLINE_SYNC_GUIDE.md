# Wildlife Watcher - Local Storage & Sync Guide

This guide explains the offline-first data collection system implemented in your Wildlife Watcher app.

## Overview

The app now supports:
- ✅ **Local Storage**: Save wildlife records offline using AsyncStorage
- ✅ **Pending Queue**: Track unsynchronized records
- ✅ **Sync to PostgreSQL**: Upload data to your backend server
- ✅ **Offline-First**: Works without internet connection
- ✅ **Status Tracking**: See which records are synced vs pending

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Wildlife Watcher App                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Data.tsx       │────────▶│ Local Storage    │         │
│  │  (UI/Form)       │         │  (AsyncStorage)  │         │
│  └──────────────────┘         └──────────────────┘         │
│          │                              │                   │
│          │                              ▼                   │
│          │                    ┌──────────────────┐         │
│          │                    │ localStorageService
│          │                    │  - saveRecord()  │         │
│          │                    │  - getAllRecords │         │
│          │                    │  - getUnsynced() │         │
│          │                    └──────────────────┘         │
│          │                              │                   │
│          └──────────────────────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│          ┌──────────────────────────────┐                  │
│          │   Sync Service               │                  │
│          │  - uploadRecords()           │                  │
│          │  - checkConnectivity()       │                  │
│          └──────────────────────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│        ┌──────────────────────────────────┐                │
│        │  PostgreSQL Backend API          │                │
│        │  POST /api/wildlife              │                │
│        │  (Your server - configure URL!)  │                │
│        └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

Each wildlife record stored in device has this structure:

```typescript
{
  id: string;                    // Local unique ID (auto-generated)
  cantidad_especies: number;     // Quantity of species
  tipo_especies: string;         // Species type (e.g., "Red Fox")
  fecha: string;                 // Date (YYYY-MM-DD)
  hora: string;                  // Time (HH:mm:ss)
  lat?: number;                  // Latitude (optional)
  long?: number;                 // Longitude (optional)
  synced?: boolean;              // Upload status
  createdAt?: number;            // Timestamp
}
```

### PostgreSQL Table Schema

Your backend server should have this table:

```sql
CREATE TABLE wildlife_records (
  id SERIAL PRIMARY KEY,
  cantidad_especies INTEGER NOT NULL,
  tipo_especies CHARACTER VARYING(255) NOT NULL,
  fecha DATE NOT NULL,
  lat NUMERIC(10,7),
  long NUMERIC(10,7),
  hora TIME WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd wildlife-watcher-mobile
npm install
# or
yarn install
```

This installs `@react-native-async-storage/async-storage` which is required for local storage.

### 2. Configure Backend API URL

Edit `src/screens/Data.tsx` and find this line (around line 45):

```typescript
syncService.setConfig({
  baseURL: 'http://your-backend-api.com', // ← CHANGE THIS
  endpoint: '/api/wildlife',
});
```

Replace `'http://your-backend-api.com'` with your actual backend URL:

```typescript
// Example for local development:
baseURL: 'http://192.168.1.100:3000'

// Example for production:
baseURL: 'https://api.wildlife-watcher.com'
```

### 3. Create Backend Endpoint

Your backend must have a `POST /api/wildlife` endpoint that accepts:

#### Request Body

```json
{
  "records": [
    {
      "cantidad_especies": 5,
      "tipo_especies": "Red Fox",
      "fecha": "2025-11-26",
      "hora": "14:30:00",
      "lat": 40.7128,
      "long": -74.0060
    }
  ]
}
```

#### Response (Expected)

```json
{
  "success": true,
  "message": "Records saved successfully",
  "errors": []
}
```

### Example Backend Implementation (Node.js/Express)

```javascript
// routes/wildlife.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL connection pool

router.post('/api/wildlife', async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid records' });
    }

    const errors = [];
    
    for (const record of records) {
      try {
        await pool.query(
          `INSERT INTO wildlife_records 
            (cantidad_especies, tipo_especies, fecha, hora, lat, long)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            record.cantidad_especies,
            record.tipo_especies,
            record.fecha,
            record.hora,
            record.lat || null,
            record.long || null,
          ]
        );
      } catch (err) {
        errors.push(err.message);
      }
    }

    res.json({
      success: errors.length === 0,
      saved: records.length - errors.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Example Backend Health Check

Add a simple `/health` endpoint for connectivity checks:

```javascript
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

## Usage

### Capturing Data

1. Open the **Data Warehouse** tab
2. Tap **"Add New Record"**
3. Fill in the form:
   - **Species Type** (required): e.g., "Red Fox", "Barn Owl"
   - **Quantity** (required): number of individuals spotted
   - **Date** (required): YYYY-MM-DD format
   - **Time** (required): HH:mm format
   - **Latitude/Longitude** (optional): precise location
4. Tap **"Save Record"**
   - Record is saved locally immediately ✅
   - Shows as "Pending" status

### Syncing Data

1. When internet connection is available:
   - Tap **"Sync to Warehouse"**
   - App sends all pending records to your PostgreSQL server
   - Records marked as "Synced" once uploaded successfully

2. View sync status:
   - **Pending Records**: count shown in sync card
   - **Storage Info**: total records, pending, and synced counts

### Offline Usage

- Records are saved locally even without internet
- Sync will retry next time you tap the sync button or app restarts
- No data loss - records stay on device until explicitly synced

## Files Overview

### Services

- **`services/localStorageService.ts`**
  - Manages all local device storage
  - Methods: `saveRecord()`, `getAllRecords()`, `getUnsyncedRecords()`, `markRecordsSynced()`, `deleteRecord()`

- **`services/syncService.ts`**
  - Handles API calls to backend
  - Methods: `uploadRecords()`, `uploadRecord()`, `checkConnectivity()`, `setConfig()`

### Screens

- **`src/screens/Data.tsx`**
  - Main UI component
  - Form for capturing data
  - Records display with search
  - Sync status and storage info

## Troubleshooting

### Issue: "No records to sync" but I have pending records

**Solution:**
- Check the "Pending Records" count in the Sync Card
- Make sure API URL is configured correctly in `Data.tsx`
- Check backend server is running and accessible

### Issue: Sync fails with network error

**Solution:**
- Verify backend API URL is correct
- Check backend server is running
- Test connectivity: `curl http://your-api.com/health`
- Check device is connected to internet

### Issue: Data not appearing on backend

**Solution:**
- Verify database table exists with correct schema
- Check backend endpoint is receiving POST requests
- Add logging to backend to debug
- Verify latitude/longitude format (numeric, not strings)

### Issue: AsyncStorage errors

**Solution:**
- Rebuild app: `npm start -- --reset-cache`
- Clear app data (device settings)
- Reinstall app

## Advanced Configuration

### Custom Timeout

In `src/screens/Data.tsx`, adjust timeout:

```typescript
syncService.setConfig({
  baseURL: 'http://your-api.com',
  endpoint: '/api/wildlife',
  timeout: 60000, // 60 seconds (default: 30s)
});
```

### Batch Upload Size

Current: uploads all pending records in one batch. To modify, edit `syncService.ts`:

```typescript
const BATCH_SIZE = 100; // Upload max 100 records per request
```

### Automatic Sync on App Start

Add to `useEffect` in `Data.tsx`:

```typescript
useEffect(() => {
  // ... existing code ...
  
  // Auto-sync on mount
  setTimeout(() => handleSync(), 2000);
}, []);
```

## API Response Error Handling

Your backend can return errors for individual records:

```json
{
  "success": true,
  "saved": 3,
  "errors": [
    "Record 2: Invalid date format",
    "Record 5: Missing species type"
  ]
}
```

The app will still mark successfully saved records as synced.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure backend URL in `Data.tsx`
3. ✅ Create PostgreSQL table on backend
4. ✅ Implement `/api/wildlife` endpoint
5. ✅ Test with "Add New Record" + "Sync to Warehouse"
6. ✅ Verify data appears in database

## Support

For issues or questions:
1. Check console logs (Expo DevTools)
2. Verify backend API is responding
3. Check network connectivity
4. Review this guide's Troubleshooting section
