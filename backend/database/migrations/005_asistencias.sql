-- =====================================================================
-- MIGRACIÓN 005: Tiqueteras (ingresos limitados) y control de asistencia
-- Base de datos: gimnasio_bd2
-- =====================================================================

USE `gimnasio_bd2`;

-- ---------------------------------------------------------------------
-- PASO 1: TIQUETERAS EN 'plan' Y 'membresia'
-- ingresos_incluidos NULL = ilimitado.
-- En 'membresia' es una copia congelada de plan.ingresos_incluidos al
-- asignar o editar la membresía (igual que precio_pagado).
-- ---------------------------------------------------------------------
ALTER TABLE `plan`
  ADD COLUMN `ingresos_incluidos` INT NULL
    COMMENT 'Número de ingresos incluidos; NULL = ilimitado' AFTER `precio`;

ALTER TABLE `membresia`
  ADD COLUMN `ingresos_incluidos` INT NULL
    COMMENT 'Copia congelada de plan.ingresos_incluidos al asignar/editar; NULL = ilimitado'
    AFTER `precio_pagado`;

-- ---------------------------------------------------------------------
-- PASO 2: TABLA 'asistencia'
-- Un ingreso por día por membresía (UNIQUE fk_membresia + fecha).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `asistencia` (
  `id_asistencia` INT NOT NULL AUTO_INCREMENT,
  `fk_membresia` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fk_usuario_registro` INT NOT NULL,

  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uq_asistencia_membresia_fecha` (`fk_membresia`, `fecha`),

  CONSTRAINT `fk_asistencia_membresia`
    FOREIGN KEY (`fk_membresia`) REFERENCES `membresia` (`id_membresia`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT `fk_asistencia_usuario_registro`
    FOREIGN KEY (`fk_usuario_registro`) REFERENCES `usuario` (`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX `idx_asistencia_fk_membresia` (`fk_membresia`),
  INDEX `idx_asistencia_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Los planes y membresías existentes quedan con ingresos_incluidos = NULL
-- (ilimitados) por defecto; no se requiere UPDATE adicional.
