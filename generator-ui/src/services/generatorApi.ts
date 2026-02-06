import type { Event, Config, EmitRequest } from '../types';

const API_BASE_URL = 'http://localhost:7070';

export const generatorApi = {
  // Health check
  async health(): Promise<{ ok: boolean; time: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('API health check failed');
    return res.json();
  },

  // Get single event
  async getEvent(): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/gen/event`);
    if (!res.ok) throw new Error('Failed to get event');
    return res.json();
  },

  // Get multiple events
  async getEvents(count: number): Promise<{ total: number; events: Event[] }> {
    const res = await fetch(`${API_BASE_URL}/gen/events?count=${count}`);
    if (!res.ok) throw new Error('Failed to get events');
    return res.json();
  },

  // Get config
  async getConfig(): Promise<Config> {
    const res = await fetch(`${API_BASE_URL}/gen/config`);
    if (!res.ok) throw new Error('Failed to get config');
    return res.json();
  },

  // Update config
  async updateConfig(config: Partial<Config>): Promise<{ message: string; config: Config }> {
    const res = await fetch(`${API_BASE_URL}/gen/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  },

  // Emit custom event
  async emitEvent(request: EmitRequest): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/gen/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!res.ok) throw new Error('Failed to emit event');
    return res.json();
  }
};
