export interface ColumnMeta {
  name: string;
  type: 'numeric' | 'categorical';
  nulls: number;
  total: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  unique?: number;
  top_value?: string;
  top_count?: number;
}

export interface Dataset {
  id: string;
  user_id: string;
  file_name: string;
  row_count: number;
  column_count: number;
  data_quality_score: number;
  columns_meta: ColumnMeta[];
  created_at: string;
}

export interface KpiMetric {
  label: string;
  value: string;
  formatted_value: string;
  sub: string;
  delta?: string;
  delta_type: 'up' | 'down' | 'neutral';
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  yAxisID?: string;
}

export interface ChartData {
  chart_type: string;
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  legends: { label: string; color: string }[];
}

export interface ProductRow {
  product_name: string;
  category: string;
  price: number;
  units_sold: number;
  revenue: number;
  earnings: number;
  downloads: number;
  refunds: number;
  rating: number | null;
}

export interface OpportunityItem {
  app_name: string;
  downloads: number;
  potential_revenue: number;
  color: string;
}

export interface InsightItem {
  title: string;
  type: 'opportunity' | 'warning' | 'insight';
  finding: string;
  impact: string;
  action: string;
  risk: string;
}

export interface AIInsight {
  id: string;
  analysis_type: string;
  content: {
    insights: InsightItem[];
    summary: string;
    key_metrics: Record<string, string>;
  };
  model_used: string;
  created_at: string;
}
