-- =====================================================================
-- MIGRACIÓN 004: Bloqueo de cuenta tras intentos fallidos de login
-- Base de datos: gimnasio_bd2
-- =====================================================================

USE `gimnasio_bd2`;

-- ---------------------------------------------------------------------
-- PASO 1: AGREGAR COLUMNAS DE CONTROL DE INTENTOS A 'usuario'
-- 1.1 intentos_fallidos: contador de intentos de login incorrectos consecutivos
-- 1.2 bloqueado_hasta: fecha/hora (de la base de datos) hasta la cual la
--     cuenta queda bloqueada; NULL cuando no hay bloqueo activo
-- ---------------------------------------------------------------------
ALTER TABLE `usuario`
  ADD COLUMN `intentos_fallidos` INT NOT NULL DEFAULT 0 AFTER `contrasena`,
  ADD COLUMN `bloqueado_hasta` DATETIME NULL AFTER `intentos_fallidos`;
