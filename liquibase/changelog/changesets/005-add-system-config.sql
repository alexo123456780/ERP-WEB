-- ============================================================
-- CHANGESET 005 · Tabla system_config (configuración del sistema)
-- Gestionado por Liquibase – NO ejecutar manualmente
-- ============================================================

CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_system_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Valores por defecto del sistema
INSERT IGNORE INTO `system_config` (`key`, `value`) VALUES
  ('primary_color', '#16a34a'),
  ('login_bg_url', NULL),
  ('theme_mode', 'system'),
  ('icon_set', 'lucide');
