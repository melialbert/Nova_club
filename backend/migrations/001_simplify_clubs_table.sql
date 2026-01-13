-- Migration: Simplifier la table clubs
-- Description: Supprime les colonnes inutiles et ajoute les champs nécessaires (ville, slogan)
-- Date: 2026-01-13

-- Ajouter les nouvelles colonnes si elles n'existent pas
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS slogan VARCHAR(500);

-- Supprimer les colonnes inutilisées
ALTER TABLE clubs DROP COLUMN IF EXISTS address;
ALTER TABLE clubs DROP COLUMN IF EXISTS phone;
ALTER TABLE clubs DROP COLUMN IF EXISTS email;

-- Vérifier la structure finale
-- La table clubs devrait maintenant avoir: id, name, city, slogan, logo_url, is_active, created_at, updated_at
