import { WildlifeRecord } from './localStorageService';

export type ApiConfig = {
  baseURL: string;                 // e.g. http://192.168.0.10:3000
  endpoint?: string;               // default: /api/wildlife
  timeout?: number;                // default: 30000ms
  token?: string;                  // Bearer authorization (optional)
};

class SyncService {
  private config: ApiConfig = {
    baseURL: process.env.REACT_APP_API_URL || '',
    endpoint: '/dw/',
    timeout: 30000,
    token: process.env.REACT_APP_API_TOKEN || undefined,
  };

  /**
   * Update API configuration
   */
  setConfig(config: Partial<ApiConfig>) {
    // Merge with existing config
    const merged: ApiConfig = { ...this.config, ...config } as ApiConfig;

    // Default endpoint if none provided
    if (!merged.endpoint) {
      merged.endpoint = '/dw';
    }

    // Ensure endpoint starts with a single leading slash
    if (merged.endpoint && !merged.endpoint.startsWith('/')) {
      merged.endpoint = `/${merged.endpoint}`;
    }

    // Remove trailing slash (FastAPI /dw vs /dw/ 307 redirect)
    if (merged.endpoint.length > 1 && merged.endpoint.endsWith('/')) {
      merged.endpoint = merged.endpoint.slice(0, -1);
    }

    this.config = merged;

    console.log('Sync service configured:', this.config);
  }

  /**
   * Upload a batch of records
   */
  async uploadRecords(
    records: WildlifeRecord[]
  ): Promise<{ success: boolean; uploadedIds: string[]; errors?: string[] }> {

    if (!this.config.baseURL) {
      return {
        success: false,
        uploadedIds: [],
        errors: ['Base URL is not configured'],
      };
    }

    if (records.length === 0) {
      return { success: true, uploadedIds: [] };
    }

    try {
      const baseURL = this.config.baseURL.replace(/\/+$/, '');
      const endpoint = this.config.endpoint || '/dw';
      const url = `${baseURL}${endpoint}`;
      console.log('📤 Uploading to:', url, 'Records:', records.length);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (this.config.token) {
        headers['Authorization'] = `Bearer ${this.config.token}`;
      }

      // Format records for backend (FastAPI /dw expects a single object, not an array)
      const formattedRecords = records.map((r) => ({
        cantidad_especies: Number.isFinite(r.cantidad_especies) ? r.cantidad_especies : 0,
        tipo_especies: r.tipo_especies,
        fecha: r.fecha,
        lat: Number.isFinite(r.lat ?? 0) ? r.lat : null,
        long: Number.isFinite(r.long ?? 0) ? r.long : null,
        hora: r.hora,
      }));

      console.log('📦 Formatted payload (per record):', JSON.stringify(formattedRecords, null, 2));

      const uploadedIds: string[] = [];
      const errors: string[] = [];

      // Send each record individually since /dw expects a single object body
      for (let i = 0; i < formattedRecords.length; i++) {
        const record = formattedRecords[i];
        const original = records[i];
        const recordId = original.id ?? `index_${i}`;

        try {
          const response = (await Promise.race([
            fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(record),
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Request timeout after ' + this.config.timeout + 'ms')),
                this.config.timeout
              )
            ),
          ])) as Response;

          const responseText = await response.text();
          console.log(`✅ Response for record ${recordId} - status:`, response.status);
          console.log(`📨 Response body for record ${recordId}:`, responseText);

          if (!response.ok) {
            errors.push(
              `Record ${recordId}: Server error ${response.status} - ${responseText}`
            );
            continue;
          }

          uploadedIds.push(recordId);
        } catch (err: any) {
          const message = err?.message || String(err);
          console.error(`❌ Upload error for record ${recordId}:`, message);
          errors.push(`Record ${recordId}: ${message}`);
        }
      }

      return {
        success: errors.length === 0,
        uploadedIds,
        errors: errors.length ? errors : undefined,
      };
    } catch (error: any) {
      console.error('❌ Upload error:', error.message);
      return {
        success: false,
        uploadedIds: [],
        errors: [error.message],
      };
    }
  }

  /**
   * Upload a single record
   */
  async uploadRecord(record: WildlifeRecord): Promise<boolean> {
    const result = await this.uploadRecords([record]);
    return result.success && result.uploadedIds.length > 0;
  }

  /**
   * Check API connection
   */
  async checkConnectivity(): Promise<boolean> {
    if (!this.config.baseURL) {
      console.warn('⚠️ Base URL not configured');
      return false;
    }

    try {
      const testUrl = `${this.config.baseURL}/health`;
      console.log('🔍 Checking connectivity to:', testUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(testUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);

      const ok = response.ok || response.status < 500;
      console.log('Connectivity:', ok ? 'OK' : 'FAILED', '(status:', response.status, ')');

      return ok;
    } catch (error) {
      console.warn('❌ Connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Test endpoint manually
   */
  async testEndpoint(): Promise<void> {
    try {
      const url = `${this.config.baseURL}${this.config.endpoint}`;
      console.log('🧪 Testing endpoint:', url);

      const testPayload = [
        {
          cantidad_especies: 1,
          tipo_especies: 'TEST',
          fecha: new Date().toISOString().split('T')[0],
          hora: '12:00:00',
          lat: null,
          long: null,
        },
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      console.log('Test response:', await response.text());
    } catch (error) {
      console.error('🧪 Test endpoint error:', error);
    }
  }

  /**
   * Quick test with a fake record
   */
  async testUpload(): Promise<void> {
    console.log('🧪 Testing upload endpoint...');

    const result = await this.uploadRecords([
      {
        id: 'test_' + Date.now(),
        cantidad_especies: 1,
        tipo_especies: 'TEST',
        fecha: new Date().toISOString().split('T')[0],
        hora: '12:00:00',
        lat: null,
        long: null,
        synced: false,
      },
    ]);

    console.log('🧪 Test upload result:', result);
  }
}

export default new SyncService();
