-- PredictIQ Supabase Schema
-- Run this in Supabase SQL Editor

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  row_count INT DEFAULT 0,
  column_count INT DEFAULT 0,
  data_quality_score FLOAT DEFAULT 0,
  columns_meta JSONB DEFAULT '[]',
  data_hash TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/apps parsed from datasets
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  product_name TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price DECIMAL(10,2) DEFAULT 0,
  units_sold INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  earnings DECIMAL(12,2) DEFAULT 0,
  downloads INT DEFAULT 0,
  refunds INT DEFAULT 0,
  rating FLOAT DEFAULT NULL,
  country TEXT DEFAULT '',
  date DATE DEFAULT NULL
);

-- Cached dashboard data
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  kpi_metrics JSONB DEFAULT '[]',
  charts_data JSONB DEFAULT '{}',
  top_products JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis history
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  analysis_type TEXT DEFAULT 'full',
  prompt TEXT DEFAULT '',
  response JSONB DEFAULT '{}',
  model_used TEXT DEFAULT '',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecast cache
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  forecast_type TEXT DEFAULT 'revenue',
  forecast_data JSONB DEFAULT '[]',
  confidence_upper JSONB DEFAULT '[]',
  confidence_lower JSONB DEFAULT '[]',
  model_used TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_dataset ON products(dataset_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_dataset ON ai_analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user ON datasets(user_id);

-- Enable Row Level Security
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Default policies (open for MVP, tighten for production)
CREATE POLICY "Allow all on datasets" ON datasets FOR ALL USING (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all on dashboards" ON dashboards FOR ALL USING (true);
CREATE POLICY "Allow all on ai_analyses" ON ai_analyses FOR ALL USING (true);
CREATE POLICY "Allow all on forecasts" ON forecasts FOR ALL USING (true);
