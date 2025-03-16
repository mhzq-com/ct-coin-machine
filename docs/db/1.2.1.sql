CREATE TABLE `error` (
	`id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Azonosító',
	`errorType` VARCHAR(50) NOT NULL COMMENT 'Hiba típusa' COLLATE 'utf8mb4_general_ci',
	`description` VARCHAR(150) NOT NULL COMMENT 'Hiba leírása' COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `u_errorType` (`errorType`) USING BTREE
)
COMMENT='Hibák'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


INSERT INTO `coin`.`setting` (`name`, `value`) VALUES ('hopper', 'HopperMH245CA');
