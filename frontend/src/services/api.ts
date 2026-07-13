import axios from 'axios';
import type { Dataset, KpiMetric, ChartData, ProductRow, OpportunityItem, AIInsight } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

export async function uploadDataset(file: File): Promise<Dataset> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/api/datasets/upload', form);
  return data;
}

export async function listDatasets(): Promise<Dataset[]> {
  const { data } = await api.get('/api/datasets');
  return data.datasets || [];
}

export async function getDataset(id: string): Promise<Dataset> {
  const { data } = await api.get(`/api/datasets/${id}`);
  return data;
}

export async function deleteDataset(id: string): Promise<void> {
  await api.delete(`/api/datasets/${id}`);
}

export async function getKpis(id: string): Promise<KpiMetric[]> {
  const { data } = await api.get(`/api/datasets/${id}/kpis`);
  return data.kpis || [];
}

export async function getCharts(id: string): Promise<Record<string, ChartData>> {
  const { data } = await api.get(`/api/datasets/${id}/charts`);
  return data.charts || {};
}

export async function getProducts(id: string, sortBy = 'revenue', limit = 50): Promise<ProductRow[]> {
  const { data } = await api.get(`/api/datasets/${id}/products`, { params: { sort_by: sortBy, limit } });
  return data.products || [];
}

export async function getOpportunities(id: string): Promise<OpportunityItem[]> {
  const { data } = await api.get(`/api/datasets/${id}/opportunities`);
  return data.opportunities || [];
}

export async function generateInsights(id: string, type = 'full', rows: any[] = [], meta: any[] = []): Promise<AIInsight> {
  const body = rows.length > 0 ? { rows, meta } : undefined;
  const { data } = await api.post(`/api/datasets/${id}/insights`, body, { params: { analysis_type: type } });
  return data;
}

export async function getInsights(id: string): Promise<AIInsight[]> {
  const { data } = await api.get(`/api/datasets/${id}/insights`);
  return data.insights || [];
}

export async function getForecastColumns(id: string): Promise<any> {
  try {
    const { data } = await api.get(`/api/datasets/${id}/forecast/columns`);
    return data;
  } catch {
    return null;
  }
}

export async function runForecast(id: string, dateCol: string, valueCol: string, periods = 30, includeHistory = true): Promise<any> {
  try {
    const { data } = await api.post(`/api/datasets/${id}/forecast`, {
      date_col: dateCol, value_col: valueCol, periods, seasonality: 'auto', include_history: includeHistory,
    });
    return data;
  } catch (err: any) {
    return { error: err?.response?.data?.detail || err.message || 'Forecast failed' };
  }
}

export async function sendChatMessage(
  id: string,
  message: string,
  history: { role: string; content: string }[] = [],
  localRows: any[] = [],
  localMeta: any[] = [],
): Promise<any> {
  const { data } = await api.post(`/api/datasets/${id}/chat`, {
    message,
    history,
    local_rows: localRows,
    local_meta: localMeta,
  });
  return data;
}

export default api;
