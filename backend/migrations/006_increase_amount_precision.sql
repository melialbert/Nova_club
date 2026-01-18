/*
  # Augmenter la précision des montants

  Cette migration augmente la précision de toutes les colonnes monétaires
  pour supporter des montants plus élevés.

  1. Modifications
    - Payments: amount NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Transactions: amount NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Members: monthly_fee, registration_fee NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Licenses: amount NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Equipment: price NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Equipment_purchases: unit_price, total_amount NUMERIC(10, 2) -> NUMERIC(15, 2)
    - Permet des montants jusqu'à 9 999 999 999 999.99 au lieu de 99 999 999.99
*/

-- Modifier les colonnes dans payments
ALTER TABLE IF EXISTS payments
ALTER COLUMN amount TYPE NUMERIC(15, 2);

-- Modifier les colonnes dans transactions
ALTER TABLE IF EXISTS transactions
ALTER COLUMN amount TYPE NUMERIC(15, 2);

-- Modifier les colonnes dans members
ALTER TABLE IF EXISTS members
ALTER COLUMN monthly_fee TYPE NUMERIC(15, 2);

ALTER TABLE IF EXISTS members
ALTER COLUMN registration_fee TYPE NUMERIC(15, 2);

-- Modifier les colonnes dans licenses
ALTER TABLE IF EXISTS licenses
ALTER COLUMN amount TYPE NUMERIC(15, 2);

-- Modifier les colonnes dans equipment
ALTER TABLE IF EXISTS equipment
ALTER COLUMN price TYPE NUMERIC(15, 2);

-- Modifier les colonnes dans equipment_purchases
ALTER TABLE IF EXISTS equipment_purchases
ALTER COLUMN unit_price TYPE NUMERIC(15, 2);

ALTER TABLE IF EXISTS equipment_purchases
ALTER COLUMN total_amount TYPE NUMERIC(15, 2);
