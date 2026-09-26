-- =====================================================================
-- MIGRACIÓN 003: Reestructuración de Pago y Membresías hacia Cliente
-- Base de datos: gimnasio_bd2
-- =====================================================================

USE `gimnasio_bd2`;

-- ---------------------------------------------------------------------
-- PASO 1: AJUSTAR TABLA 'pago'
-- 1.1 Quitar la llave foránea hacia membresia_cliente (nombre por defecto en dump: pago_ibfk_1)
-- 1.2 Renombrar la columna fk_membresia_cliente a fk_membresia
-- 1.3 Conectar fk_membresia -> membresia.id_membresia con ON DELETE RESTRICT ON UPDATE CASCADE
-- ---------------------------------------------------------------------
ALTER TABLE `pago`
  DROP FOREIGN KEY `pago_ibfk_1`,
  DROP INDEX `fk_membresia_cliente`;

ALTER TABLE `pago`
  CHANGE COLUMN `fk_membresia_cliente` `fk_membresia` INT NOT NULL;

ALTER TABLE `pago`
  ADD CONSTRAINT `fk_pago_membresia`
    FOREIGN KEY (`fk_membresia`) REFERENCES `membresia` (`id_membresia`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD INDEX `idx_pago_fk_membresia` (`fk_membresia`);

-- ---------------------------------------------------------------------
-- PASO 2: ELIMINAR TABLAS ANTIGUAS EN DESUSO
-- (Una vez desvinculada la tabla pago, ya no tienen dependencias)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `membresia_cliente`;
DROP TABLE IF EXISTS `plan_membresia`;

-- ---------------------------------------------------------------------
-- PASO 3: REFACTORIZAR TABLA 'membresia'
-- 3.1 Quitar fk_usuario, su índice y su llave foránea
-- 3.2 Agregar fk_cliente conectada a cliente.id_cliente con ON DELETE RESTRICT ON UPDATE CASCADE
-- ---------------------------------------------------------------------
ALTER TABLE `membresia`
  DROP FOREIGN KEY `fk_membresia_usuario`,
  DROP INDEX `idx_membresia_fk_usuario`,
  DROP COLUMN `fk_usuario`;

ALTER TABLE `membresia`
  ADD COLUMN `fk_cliente` INT NOT NULL AFTER `id_membresia`,
  ADD CONSTRAINT `fk_membresia_cliente`
    FOREIGN KEY (`fk_cliente`) REFERENCES `cliente` (`id_cliente`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD INDEX `idx_membresia_fk_cliente` (`fk_cliente`);
