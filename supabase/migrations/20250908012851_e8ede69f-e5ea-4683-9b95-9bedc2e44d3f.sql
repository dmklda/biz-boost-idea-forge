-- Add business-model-canvas content type support to generated_content table
-- Check if we need to add any constraints or indexes for better performance

-- Create index for better performance on content_type queries
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);

-- Create index for user content queries
CREATE INDEX IF NOT EXISTS idx_generated_content_user_type ON generated_content(user_id, content_type);

-- Verify the table structure supports our new content type
-- The generated_content table should already exist and support JSON data