-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema soventory
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema soventory
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `soventory` DEFAULT CHARACTER SET utf8 ;
USE `soventory` ;

-- -----------------------------------------------------
-- Table `soventory`.`materiel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`materiel` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`marque`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`marque` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`section`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`section` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`etat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`etat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`lieu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`lieu` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`item`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`item` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type_material_FK` INT NOT NULL,
  `marque_FK` INT NOT NULL,
  `model` VARCHAR(255) NOT NULL,
  `num_serie` VARCHAR(255) NOT NULL,
  `num_produit` VARCHAR(255) NULL,
  `section_FK` INT NOT NULL,
  `etat_FK` INT NOT NULL,
  `lieu_FK` INT NOT NULL,
  `remarque` TEXT(255) NULL,
  `date_achat` DATE NOT NULL,
  `garantie` INT NOT NULL,
  `fin_garantie` DATE NOT NULL,
  `prix` DECIMAL(10,2) NOT NULL,
  `archive` TINYINT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_item_type_materiel_idx` (`type_material_FK` ASC) VISIBLE,
  INDEX `fk_item_item_brand1_idx` (`marque_FK` ASC) VISIBLE,
  INDEX `fk_item_section1_idx` (`section_FK` ASC) VISIBLE,
  INDEX `fk_item_etat1_idx` (`etat_FK` ASC) VISIBLE,
  INDEX `fk_item_lieu1_idx` (`lieu_FK` ASC) VISIBLE,
  CONSTRAINT `fk_item_type_materiel`
    FOREIGN KEY (`type_material_FK`)
    REFERENCES `soventory`.`materiel` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_item_brand1`
    FOREIGN KEY (`marque_FK`)
    REFERENCES `soventory`.`marque` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_section1`
    FOREIGN KEY (`section_FK`)
    REFERENCES `soventory`.`section` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_etat1`
    FOREIGN KEY (`etat_FK`)
    REFERENCES `soventory`.`etat` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_lieu1`
    FOREIGN KEY (`lieu_FK`)
    REFERENCES `soventory`.`lieu` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`droit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`droit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`utilisateur`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`utilisateur` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom_utilisateur` VARCHAR(255) NOT NULL,
  `mot_de_passe` VARCHAR(255) NOT NULL,
  `droit_FK` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_droit1_idx` (`droit_FK` ASC) VISIBLE,
  UNIQUE INDEX `nom_utilisateur_UNIQUE` (`nom_utilisateur` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `fk_user_droit1`
    FOREIGN KEY (`droit_FK`)
    REFERENCES `soventory`.`droit` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `soventory`.`refreshToken`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `soventory`.`refreshToken` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(512) NOT NULL,
  `utilisateur_FK` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_session_utilisateur1_idx` (`utilisateur_FK` ASC) VISIBLE,
  UNIQUE INDEX `token_UNIQUE` (`token` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `fk_session_utilisateur1`
    FOREIGN KEY (`utilisateur_FK`)
    REFERENCES `soventory`.`utilisateur` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
