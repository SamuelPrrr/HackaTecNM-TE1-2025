import AsyncStorage from '@react-native-async-storage/async-storage';

export type WildlifeRecord = {
  id?: string; // local unique id, assigned before upload
  cantidad_especies: number;
  tipo_especies: string;
  fecha: string; // YYYY-MM-DD
  lat?: number;
  long?: number;
  hora: string; // HH:mm:ss
  synced?: boolean; // true if uploaded to server
  createdAt?: number; // timestamp for local tracking
};

const STORAGE_KEY = 'wildlife_records';
const SYNCED_RECORDS_KEY = 'wildlife_records_synced';

class LocalStorageService {
  /**
   * Save a new wildlife record locally
   */
  async saveRecord(record: WildlifeRecord): Promise<WildlifeRecord> {
    try {
      const records = await this.getAllRecords();
      const newRecord: WildlifeRecord = {
        ...record,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        synced: false,
      };
      records.push(newRecord);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      console.log('Record saved locally:', newRecord);
      return newRecord;
    } catch (error) {
      console.error('Error saving record:', error);
      throw error;
    }
  }

  /**
   * Get all local records (synced and unsynced)
   */
  async getAllRecords(): Promise<WildlifeRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all records:', error);
      return [];
    }
  }

  /**
   * Get only unsynced records (pending upload)
   */
  async getUnsyncedRecords(): Promise<WildlifeRecord[]> {
    try {
      const records = await this.getAllRecords();
      return records.filter((r) => !r.synced);
    } catch (error) {
      console.error('Error getting unsynced records:', error);
      return [];
    }
  }

  /**
   * Mark records as synced after successful upload
   */
  async markRecordsSynced(recordIds: string[]): Promise<void> {
    try {
      const records = await this.getAllRecords();
      const updated = records.map((r) =>
        recordIds.includes(r.id || '') ? { ...r, synced: true } : r
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log(`Marked ${recordIds.length} records as synced`);
    } catch (error) {
      console.error('Error marking records synced:', error);
      throw error;
    }
  }

  /**
   * Delete a record locally
   */
  async deleteRecord(recordId: string): Promise<void> {
    try {
      const records = await this.getAllRecords();
      const filtered = records.filter((r) => r.id !== recordId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('Record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  /**
   * Clear all local records
   */
  async clearAllRecords(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('All records cleared');
    } catch (error) {
      console.error('Error clearing records:', error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ total: number; unsynced: number }> {
    try {
      const records = await this.getAllRecords();
      const unsynced = records.filter((r) => !r.synced).length;
      return {
        total: records.length,
        unsynced,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { total: 0, unsynced: 0 };
    }
  }
}

export default new LocalStorageService();
