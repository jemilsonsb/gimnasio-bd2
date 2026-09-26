-- Migracion de los ENUM usuario.estado y administrador.nivel_acceso
-- a catalogos normalizados con llaves foraneas.
-- Ejecutar una sola vez sobre la base gimnasio_bd2 con respaldo previo.
-- Esta migracion no debe ejecutarse desde la aplicacion Node.js.

USE `gimnasio_bd2`;

-- 1. Crear catalogos y sembrar todos los valores admitidos.
CREATE TABLE IF NOT EXISTS `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `uq_estado_nombre` (`nombre_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nivel_acceso` (
  `id_nivel_acceso` int NOT NULL AUTO_INCREMENT,
  `nombre_nivel_acceso` varchar(20) NOT NULL,
  PRIMARY KEY (`id_nivel_acceso`),
  UNIQUE KEY `uq_nivel_acceso_nombre` (`nombre_nivel_acceso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `estado` (`nombre_estado`)
VALUES ('Activo'), ('Inactivo');

INSERT IGNORE INTO `nivel_acceso` (`nombre_nivel_acceso`)
VALUES ('Total'), ('Limitado');

-- Reglas CHECK agregadas mediante ALTER TABLE, como soporte adicional
-- a las llaves foraneas que garantizan la pertenencia al catalogo.
ALTER TABLE `estado`
  ADD CONSTRAINT `chk_estado_nombre`
  CHECK (`nombre_estado` IN ('Activo', 'Inactivo'));

ALTER TABLE `nivel_acceso`
  ADD CONSTRAINT `chk_nivel_acceso_nombre`
  CHECK (`nombre_nivel_acceso` IN ('Total', 'Limitado'));

-- 2. Agregar columnas de migracion inicialmente nullable.
ALTER TABLE `usuario`
  ADD COLUMN `fk_estado` int NULL AFTER `estado`;

ALTER TABLE `administrador`
  ADD COLUMN `fk_nivel_acceso` int NULL AFTER `nivel_acceso`;

-- 3. Copiar valores ENUM existentes a sus filas de catalogo.
UPDATE `usuario` AS u
JOIN `estado` AS e ON e.`nombre_estado` = COALESCE(u.`estado`, 'Activo')
SET u.`fk_estado` = e.`id_estado`;

UPDATE `administrador` AS a
JOIN `nivel_acceso` AS n
  ON n.`nombre_nivel_acceso` = COALESCE(a.`nivel_acceso`, 'Total')
SET a.`fk_nivel_acceso` = n.`id_nivel_acceso`;

-- Asegurar que ningun registro quede sin correspondencia antes de exigir NOT NULL.
-- Si una consulta devuelve filas, detenerse y corregir esos datos antes de continuar.
SELECT `id_usuario` AS `registro_sin_estado`
FROM `usuario`
WHERE `fk_estado` IS NULL;

SELECT `id_administrador` AS `registro_sin_nivel_acceso`
FROM `administrador`
WHERE `fk_nivel_acceso` IS NULL;

-- 4. Hacer obligatorias las referencias, crear las llaves foraneas y retirar ENUM.
ALTER TABLE `usuario`
  MODIFY COLUMN `fk_estado` int NOT NULL,
  ADD CONSTRAINT `fk_usuario_estado`
    FOREIGN KEY (`fk_estado`) REFERENCES `estado` (`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  DROP COLUMN `estado`;

ALTER TABLE `administrador`
  MODIFY COLUMN `fk_nivel_acceso` int NOT NULL,
  ADD CONSTRAINT `fk_administrador_nivel_acceso`
    FOREIGN KEY (`fk_nivel_acceso`) REFERENCES `nivel_acceso` (`id_nivel_acceso`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  DROP COLUMN `nivel_acceso`;
