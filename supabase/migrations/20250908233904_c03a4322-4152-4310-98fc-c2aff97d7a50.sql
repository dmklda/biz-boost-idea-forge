-- Update the generated_content table constraint to include business-model-canvas and other missing content types
ALTER TABLE public.generated_content 
DROP CONSTRAINT IF EXISTS generated_content_content_type_check;

-- Add new constraint with all the content types that are actually used in the application
ALTER TABLE public.generated_content 
ADD CONSTRAINT generated_content_content_type_check 
CHECK (content_type IN (
  'logo', 
  'prd', 
  'mvp', 
  'business-model-canvas',
  'business-plan',
  'pitch-deck',
  'marketing-strategy',
  'financial-analysis',
  'competitor-analysis',
  'market-analysis',
  'pricing-model',
  'revenue-forecast',
  'investment-simulator',
  'valuation-calculator',
  'color-palette',
  'landing-page',
  'social-media-plan',
  'content-marketing',
  'seo-analysis',
  'user-research',
  'startup-kit',
  'roadmap',
  'business-name',
  'trend-analysis',
  'market-timing',
  'cac-ltv',
  'process-automation',
  'invoice-generator',
  'post-generator',
  'ai-image-editor',
  'report-creator'
));