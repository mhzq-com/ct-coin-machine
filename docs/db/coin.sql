-- --------------------------------------------------------
-- Hoszt:                        192.168.1.109
-- Szerver verzió:               10.5.12-MariaDB-0+deb11u1 - Debian 11
-- Szerver OS:                   debian-linux-gnu
-- HeidiSQL Verzió:              12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Adatbázis struktúra mentése a coin.
CREATE DATABASE IF NOT EXISTS `coin` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `coin`;

-- Struktúra mentése tábla coin. error
CREATE TABLE IF NOT EXISTS `error` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Azonosító',
  `errorType` varchar(50) NOT NULL COMMENT 'Hiba típusa',
  `description` varchar(150) NOT NULL COMMENT 'Hiba leírása',
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_errorType` (`errorType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Hibák';

-- Tábla adatainak mentése coin.error: ~1 rows (hozzávetőleg)

-- Struktúra mentése tábla coin. log
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Azonosító',
  `userId` int(11) DEFAULT NULL COMMENT 'NUBES Felhasználó azonosító',
  `userName` varchar(255) DEFAULT NULL COMMENT 'NUBES Felhasználó név',
  `logType` varchar(50) NOT NULL COMMENT 'Típus',
  `description` longtext DEFAULT NULL COMMENT 'Leírás',
  `createDate` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Létrehozás dátuma',
  `isSent` tinyint(1) DEFAULT 0 COMMENT 'Elküldve a szervernek',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Tábla adatainak mentése coin.log: ~0 rows (hozzávetőleg)

-- Struktúra mentése tábla coin. setting
CREATE TABLE IF NOT EXISTS `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT 'Beállítás név',
  `value` varchar(100) NOT NULL COMMENT 'Érték',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `u_key` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- Tábla adatainak mentése coin.setting: ~3 rows (hozzávetőleg)
INSERT INTO `setting` (`id`, `name`, `value`) VALUES
	(1, 'coinCount', '0'),
	(2, 'pin', '0eb1598c2177c525be55821a360741593a0a7d2137e1ad5c38d2e32c3a54df4b'),
	(3, 'serialNumber', '500');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
