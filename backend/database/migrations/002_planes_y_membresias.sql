-- =====================================================================
-- MIGRACIÓN: Módulo de Planes y Membresías
-- Base de datos: gimnasio_bd2
-- Descripción: Creación de tablas 'plan' y 'membresia' con llaves foráneas,
--              índices de consulta y restricciones de integridad.
-- =====================================================================

USE `gimnasio_bd2`;

-- ---------------------------------------------------------------------
-- 1. TABLA: plan
-- Catálogo de planes ofrecidos por el gimnasio.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan` (
  `id_plan` INT NOT NULL AUTO_INCREMENT,
  `nombre_plan` VARCHAR(100) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` TEXT COLLATE utf8mb4_0900_ai_ci NULL,
  `duracion_dias` INT NOT NULL,
  `precio` DECIMAL(10, 2) NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Activo/Disponible, 0 = Desactivado',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `uq_plan_nombre` (`nombre_plan`),
  CONSTRAINT `chk_plan_duracion` CHECK (`duracion_dias` > 0),
  CONSTRAINT `chk_plan_precio` CHECK (`precio` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 2. TABLA: membresia
-- Asignaciones de planes a usuarios (clientes).
-- Relación membresia -> usuario con ON DELETE RESTRICT (integridad histórica).
-- Relación membresia -> plan con ON DELETE RESTRICT.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membresia` (
  `id_membresia` INT NOT NULL AUTO_INCREMENT,
  `fk_usuario` INT NOT NULL,
  `fk_plan` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_vencimiento` DATE NOT NULL,
  `precio_pagado` DECIMAL(10, 2) NOT NULL COMMENT 'Precio congelado al momento de la asignación',
  `estado_membresia` VARCHAR(20) COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'Activa',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id_membresia`),

  -- Llaves Foráneas
  CONSTRAINT `fk_membresia_usuario`
    FOREIGN KEY (`fk_usuario`) REFERENCES `usuario` (`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT `fk_membresia_plan`
    FOREIGN KEY (`fk_plan`) REFERENCES `plan` (`id_plan`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Restricciones de Dominio
  CONSTRAINT `chk_membresia_fechas` CHECK (`fecha_vencimiento` >= `fecha_inicio`),
  CONSTRAINT `chk_membresia_precio` CHECK (`precio_pagado` >= 0),
  CONSTRAINT `chk_membresia_estado` CHECK (`estado_membresia` IN ('Activa', 'Vencida', 'Cancelada')),

  -- Índices para optimizar consultas de búsquedas por usuario, plan y estado/fechas
  INDEX `idx_membresia_fk_usuario` (`fk_usuario`),
  INDEX `idx_membresia_fk_plan` (`fk_plan`),
  INDEX `idx_membresia_vigencia` (`estado_membresia`, `fecha_inicio`, `fecha_vencimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 3. DATOS DE EJEMPLO / SEMILLAS INICIALES (Opcional)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `plan` (`nombre_plan`, `descripcion`, `duracion_dias`, `precio`, `activo`)
VALUES 
  ('Mensual Básico', 'Acceso a sala de musculación por 30 días', 30, 29.99, 1),
  ('Trimestral Pro', 'Acceso completo a musculación y cardio por 90 días', 90, 79.99, 1),
  ('Anual VIP', 'Acceso total + todas las clases grupales por 365 días', 365, 299.99, 1);
