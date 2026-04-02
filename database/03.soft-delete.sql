-- Migration: soft delete support for subjects
-- Students and teachers already have activo via the users table

ALTER TABLE subjects
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;
