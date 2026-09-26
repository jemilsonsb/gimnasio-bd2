-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: gimnasio_bd2
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `id_administrador` int NOT NULL AUTO_INCREMENT,
  `nivel_acceso` enum('Total','Limitado') COLLATE utf8mb4_unicode_ci DEFAULT 'Total',
  `departamento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_usuario` int NOT NULL,
  PRIMARY KEY (`id_administrador`),
  UNIQUE KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (1,'Total','Direccion General',2);
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clase`
--

DROP TABLE IF EXISTS `clase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clase` (
  `id_clase` int NOT NULL AUTO_INCREMENT,
  `nombre_clase` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `capacidad_maxima` int NOT NULL,
  PRIMARY KEY (`id_clase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clase`
--

LOCK TABLES `clase` WRITE;
/*!40000 ALTER TABLE `clase` DISABLE KEYS */;
/*!40000 ALTER TABLE `clase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `codigo_miembro` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `contacto_emergencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_usuario` int NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `fk_usuario` (`fk_usuario`),
  UNIQUE KEY `codigo_miembro` (`codigo_miembro`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'CLI-2',NULL,NULL,2),(2,'CLI-4',NULL,NULL,4),(3,'CLI-5',NULL,NULL,5),(4,'CLI-6',NULL,NULL,6),(5,'CLI-7',NULL,NULL,7),(6,'CLI-8',NULL,NULL,8),(7,'CLI-9',NULL,NULL,9);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_rutina`
--

DROP TABLE IF EXISTS `detalle_rutina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_rutina` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `dia_semana` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `series` int NOT NULL,
  `repeticiones` int NOT NULL,
  `descanso_segundos` int DEFAULT NULL,
  `fk_rutina` int NOT NULL,
  `fk_ejercicio` int NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_rutina` (`fk_rutina`),
  KEY `fk_ejercicio` (`fk_ejercicio`),
  CONSTRAINT `detalle_rutina_ibfk_1` FOREIGN KEY (`fk_rutina`) REFERENCES `rutina` (`id_rutina`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_rutina_ibfk_2` FOREIGN KEY (`fk_ejercicio`) REFERENCES `ejercicio` (`id_ejercicio`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_rutina`
--

LOCK TABLES `detalle_rutina` WRITE;
/*!40000 ALTER TABLE `detalle_rutina` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_rutina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ejercicio`
--

DROP TABLE IF EXISTS `ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicio` (
  `id_ejercicio` int NOT NULL AUTO_INCREMENT,
  `nombre_ejercicio` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grupo_muscular` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_ejercicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicio`
--

LOCK TABLES `ejercicio` WRITE;
/*!40000 ALTER TABLE `ejercicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrenador`
--

DROP TABLE IF EXISTS `entrenador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrenador` (
  `id_entrenador` int NOT NULL AUTO_INCREMENT,
  `especialidad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `licencia_certificacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `turno_trabajo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_usuario` int NOT NULL,
  PRIMARY KEY (`id_entrenador`),
  UNIQUE KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `entrenador_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrenador`
--

LOCK TABLES `entrenador` WRITE;
/*!40000 ALTER TABLE `entrenador` DISABLE KEYS */;
INSERT INTO `entrenador` VALUES (1,'Musculacion','Certificado ACSM','Manana',6),(2,'Musculacion','Certificado ACSM','Manana',7);
/*!40000 ALTER TABLE `entrenador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ficha_tecnica`
--

DROP TABLE IF EXISTS `ficha_tecnica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ficha_tecnica` (
  `id_ficha` int NOT NULL AUTO_INCREMENT,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `estatura` decimal(5,2) DEFAULT NULL,
  `porcentaje_grasa` decimal(4,2) DEFAULT NULL,
  `observaciones_medicas` text COLLATE utf8mb4_unicode_ci,
  `objetivos` text COLLATE utf8mb4_unicode_ci,
  `fecha_actualizacion` datetime DEFAULT NULL,
  `fk_cliente` int NOT NULL,
  PRIMARY KEY (`id_ficha`),
  UNIQUE KEY `fk_cliente` (`fk_cliente`),
  CONSTRAINT `ficha_tecnica_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ficha_tecnica`
--

LOCK TABLES `ficha_tecnica` WRITE;
/*!40000 ALTER TABLE `ficha_tecnica` DISABLE KEYS */;
/*!40000 ALTER TABLE `ficha_tecnica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membresia_cliente`
--

DROP TABLE IF EXISTS `membresia_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membresia_cliente` (
  `id_membresia_cliente` int NOT NULL AUTO_INCREMENT,
  `fecha_inicio` datetime NOT NULL,
  `fecha_vencimiento` datetime NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_cliente` int NOT NULL,
  `fk_plan` int NOT NULL,
  PRIMARY KEY (`id_membresia_cliente`),
  KEY `fk_cliente` (`fk_cliente`),
  KEY `fk_plan` (`fk_plan`),
  KEY `idx_membresia_fecha_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `membresia_cliente_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `membresia_cliente_ibfk_2` FOREIGN KEY (`fk_plan`) REFERENCES `plan_membresia` (`id_plan`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresia_cliente`
--

LOCK TABLES `membresia_cliente` WRITE;
/*!40000 ALTER TABLE `membresia_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `membresia_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `metodo_pago` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_membresia_cliente` int NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `fk_membresia_cliente` (`fk_membresia_cliente`),
  KEY `idx_pago_fecha_pago` (`fecha_pago`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`fk_membresia_cliente`) REFERENCES `membresia_cliente` (`id_membresia_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_membresia`
--

DROP TABLE IF EXISTS `plan_membresia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_membresia` (
  `id_plan` int NOT NULL AUTO_INCREMENT,
  `nombre_plan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `duracion_dias` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_membresia`
--

LOCK TABLES `plan_membresia` WRITE;
/*!40000 ALTER TABLE `plan_membresia` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_membresia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programacion_clase`
--

DROP TABLE IF EXISTS `programacion_clase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programacion_clase` (
  `id_programacion` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `cupos_disponibles` int NOT NULL,
  `fk_clase` int NOT NULL,
  `fk_entrenador` int NOT NULL,
  PRIMARY KEY (`id_programacion`),
  KEY `fk_clase` (`fk_clase`),
  KEY `fk_entrenador` (`fk_entrenador`),
  KEY `idx_programacion_fecha` (`fecha`),
  CONSTRAINT `programacion_clase_ibfk_1` FOREIGN KEY (`fk_clase`) REFERENCES `clase` (`id_clase`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `programacion_clase_ibfk_2` FOREIGN KEY (`fk_entrenador`) REFERENCES `entrenador` (`id_entrenador`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programacion_clase`
--

LOCK TABLES `programacion_clase` WRITE;
/*!40000 ALTER TABLE `programacion_clase` DISABLE KEYS */;
/*!40000 ALTER TABLE `programacion_clase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva_clase`
--

DROP TABLE IF EXISTS `reserva_clase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva_clase` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fecha_reserva` datetime DEFAULT NULL,
  `estado_reserva` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_programacion` int NOT NULL,
  `fk_cliente` int NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `fk_programacion` (`fk_programacion`),
  KEY `fk_cliente` (`fk_cliente`),
  CONSTRAINT `reserva_clase_ibfk_1` FOREIGN KEY (`fk_programacion`) REFERENCES `programacion_clase` (`id_programacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `reserva_clase_ibfk_2` FOREIGN KEY (`fk_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva_clase`
--

LOCK TABLES `reserva_clase` WRITE;
/*!40000 ALTER TABLE `reserva_clase` DISABLE KEYS */;
/*!40000 ALTER TABLE `reserva_clase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` enum('Administrador','Entrenador','Cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Cliente','Usuario cliente del gimnasio'),(2,'Administrador','Acceso completo al sistema'),(3,'Entrenador','Gestion de rutinas y clases');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutina`
--

DROP TABLE IF EXISTS `rutina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutina` (
  `id_rutina` int NOT NULL AUTO_INCREMENT,
  `nombre_rutina` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivo` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fk_cliente` int NOT NULL,
  `fk_entrenador` int NOT NULL,
  PRIMARY KEY (`id_rutina`),
  KEY `fk_cliente` (`fk_cliente`),
  KEY `fk_entrenador` (`fk_entrenador`),
  KEY `idx_rutina_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `rutina_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `rutina_ibfk_2` FOREIGN KEY (`fk_entrenador`) REFERENCES `entrenador` (`id_entrenador`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutina`
--

LOCK TABLES `rutina` WRITE;
/*!40000 ALTER TABLE `rutina` DISABLE KEYS */;
/*!40000 ALTER TABLE `rutina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_identidad` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci DEFAULT 'Activo',
  `fecha_registro` datetime DEFAULT NULL,
  `fk_rol` int NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `documento_identidad` (`documento_identidad`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_rol` (`fk_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `rol` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Ana','García','1001234567','ana@example.com','123456','3001234567','Activo','2026-09-14 10:53:03',1),(2,'Jemilson','Solano','1102818815','admin@gimnasio.com','$2b$12$T0aMEzUA1Jdpc.hTZbxoKuJTZ8dCMU2cYSIQz8KT.rar2cMTfMTIq','3217525978','Activo','2026-09-14 20:11:10',2),(4,'Jose','Borja','1102818816','admin2@gimnasio.com','$2b$12$6Kdj5yB7CN9BEyUTfux38up2LFI5dx7xyXI3y4ZrWSbAN2FkkAs/K','3217525979','Activo','2026-09-14 20:36:56',1),(5,'Cristina','Restrepo','123456','cris@gmail.com','$2b$12$UgVBjqNTGUb5NBM8OavAi.cIQYsSA2svgg.vYecHgj5j3I99IkXnu','3525252','Activo','2026-09-15 00:08:34',1),(6,'Michael','Polo','11223344551','entrenador1@gimnasio.com','$2b$12$xMEwtjYqQgEJJDEvS0vINe3OEpVbZ0.yQkVyrIQz2zavDQecUxxHm','4635263','Inactivo','2026-09-15 00:17:25',3),(7,'mama','mami','1334566','mama@gmail.com','$2b$12$YayndcCvW6gofrc1d99YuOSp9VwxWjw4uRI1alXEraPPwbntlURAC','3454635','Activo','2026-09-15 09:05:58',3),(8,'papa','papi','1122212','papa@gmail.com','$2b$12$yeYwXV0ytt.2BzSIVkthrOtgsXlBkNZoDDadTf4kLKtEHH86VoF1m','34262525','Inactivo','2026-09-15 09:14:05',3),(9,'Profe','Bd','12344544','profe@gmail.com','$2b$12$oAp9Kt57foztrlatwA/1zecd0vNh8YoRWarOhEK.ynU7STDdn9KFe','3382827','Activo','2026-09-15 11:11:30',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gimnasio_bd2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25 12:02:53
