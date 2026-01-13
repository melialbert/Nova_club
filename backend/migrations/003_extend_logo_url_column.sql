/*
  # Extend logo_url column to support base64 images

  1. Changes
    - Modify `clubs.logo_url` column from VARCHAR(500) to TEXT
    - This allows storing base64-encoded images which can be 40KB+ in size

  2. Security
    - No security changes required as this only affects column size
*/

-- Extend logo_url column to TEXT to support base64 images
ALTER TABLE clubs
ALTER COLUMN logo_url TYPE TEXT;
