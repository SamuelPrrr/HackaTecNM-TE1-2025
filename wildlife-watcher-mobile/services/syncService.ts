import { WildlifeRecord } from './localStorageService';

export type ApiConfig = {
  baseURL: string; // e.g., 'https://your-api.com' or 'http://localhost:3000'
  endpoint?: string; // default: '/api/wildlife'
  timeout?: number; // default: 30000ms
};

class SyncService {
  private config: ApiConfig = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    endpoint: '/api/wildlife',
    timeout: 30000,
  };

  /**
   * Set or update API configuration
   */
  setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
    console.log('Sync service configured:', this.config);
  }

  /**
   * Upload a batch of records to the PostgreSQL server
   */
  async uploadRecords(records: WildlifeRecord[]): Promise<{ success: boolean; uploadedIds: string[]; errors?: string[] }> {
    if (records.length === 0) {
      return { success: true, uploadedIds: [] };
    }

    try {
      const url = `${this.config.baseURL}${this.config.endpoint}`;
      console.log('Uploading to:', url, 'Records:', records.length);

      const response = (await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: records.map((r) => ({
              cantidad_especies: r.cantidad_especies,
              tipo_especies: r.tipo_especies,
              fecha: r.fecha,
              lat: r.lat || null,
              long: r.long || null,
              hora: r.hora,
            })),
          }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
        ),
      ])) as Response;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);

      return {
        success: true,
        uploadedIds: records.map((r) => r.id || ''),
        errors: result.errors || [],
      };
    } catch (error: any) {
      console.error('Upload error:', error.message);
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
   * Check if API is reachable
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = (await Promise.race([
        fetch(`${this.config.baseURL}/health`, { method: 'GET' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ])) as Response;
      return response.ok || response.status < 500;
    } catch (error) {
      console.warn('Connectivity check failed:', error);
      return false;
    }
  }
}

export default new SyncService();
