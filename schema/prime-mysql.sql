
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


--
-- Table structure for table `prime_fields`
--

CREATE TABLE IF NOT EXISTS `prime_fields` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) unsigned NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `caption` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `field` varchar(255) NOT NULL,
  `default` varchar(255) NOT NULL,
  `visible` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `required` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `options` varchar(512) NOT NULL,
  `position` int(11) unsigned NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `resource_type` (`resource_type`),
  KEY `position` (`position`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
--
--

CREATE TABLE IF NOT EXISTS `prime_files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `ext` varchar(16) DEFAULT NULL,
  `mime` varchar(32) DEFAULT NULL,
  `size` bigint(20) unsigned DEFAULT NULL,
  `width` int(6) DEFAULT NULL,
  `height` int(6) DEFAULT NULL,
  `bits` varchar(16) DEFAULT NULL,
  `channels` varchar(16) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


--
-- Table structure and data for table `prime_modules`
--

CREATE TABLE IF NOT EXISTS `prime_modules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `controller` varchar(128) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(128) NOT NULL,
  `version` varchar(16) NOT NULL,
  `js` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `position` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `prime_modules` (`controller`, `slug`, `name`, `description`, `version`, `js`, `position`) VALUES
('Prime_Module_Fieldset_List',   'prime.fieldset.list',   'Fieldset List',      'Displays a list of items from the selected Fieldset List', '1.0', 0, 3),
('Prime_Module_Fieldset_Insert', 'prime.fieldset.insert', 'Fieldset Insert',    'Displays an input form for entering data into the selected Fieldset List', '1.0', 0, 5),
('Prime_Module_Fieldset_Item',   'prime.fieldset.item',   'Fieldset Item',      'Displays a single item from a Fieldset List', '1.0', 0, 4),
('Prime_Module_Navigation',      'prime.navigation',      'Navigation',         'Displays the navigation of a website', '1.0', 0, 0),
('Prime_Module_Html',            'prime.html',            'HTML Content',       'Allows free editing of HTML with WYSIWYG capabilities', '1.0', 1, 1),
('Prime_Module_Multiview',       'prime.multiview',       'Multi View',         'Displays a control which can contain other content', '1.0', 0, 2),
('Prime_Module_Datasource',      'prime.datasource',      'Remote Data-Source', 'Get remote data from datasource. Includes authentication.', '1.0', 0, 6),
('Prime_Module_User_Signin',     'prime.user.signin',     'User Sign-in',       'Allows users to sign-in to the website.', '1.0', 0, 7),
('Prime_Module_User_Forgot',     'prime.user.forgot',     'User Forgot Password', 'Enables user to reset his password through email address.', '1.0', 0, 8),
('Prime_Module_User_Signup',     'prime.user.signup',     'User Sign Up', 'Allows users to sign-up to the website.', '1.0', 0, 9),
('Prime_Module_Search',          'prime.search',          'Search Results', 'Display search results for specified query string', '1.0', 0, 10);


--
-- Table structure for table `prime_module_fieldsets`
--

CREATE TABLE IF NOT EXISTS `prime_module_fieldsets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `position` int(11) unsigned NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `position` (`position`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Table structure for table `prime_module_fieldset_items`
--

CREATE TABLE IF NOT EXISTS `prime_module_fieldset_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prime_module_fieldset_id` int(11) unsigned NOT NULL,
  `data` text NOT NULL,
  `position` int(11) unsigned NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prime_module_fieldset_id` (`prime_module_fieldset_id`),
  KEY `position` (`position`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Table structure for table `prime_pages`
--

CREATE TABLE IF NOT EXISTS `prime_pages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `language` varchar(16) NOT NULL DEFAULT 'en-us',
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `slug_auto` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `template` varchar(255) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `keywords` varchar(255) NOT NULL,
  `noindex` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `nofollow` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `redirect` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `redirect_url` varchar(255) DEFAULT NULL,
  `protocol` varchar(32) NOT NULL,
  `method` varchar(32) NOT NULL,
  `ajax` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `visible` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `disabled` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `position` int(11) unsigned NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `slug` (`slug`),
  KEY `visible` (`visible`),
  KEY `position` (`position`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Table structure for table `prime_regions`
--

CREATE TABLE IF NOT EXISTS `prime_regions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prime_page_id` int(11) unsigned NOT NULL,
  `prime_module_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `settings` text NOT NULL,
  `position` int(11) unsigned NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_id` (`prime_page_id`),
  KEY `prime_module_id` (`prime_module_id`),
  KEY `position` (`position`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Table structure and data for table `roles`
--

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `roles` (`name`, `description`) VALUES
('login', 'Login role'),
('prime', 'Prime role');

--
-- Table structure for table `roles_users`
--

CREATE TABLE IF NOT EXISTS `roles_users` (
  `user_id` int(10) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(64) NOT NULL,
  `data` text NOT NULL,
  `logins` int(10) unsigned NOT NULL DEFAULT '0',
  `language` varchar(16) NOT NULL DEFAULT 'en-us',
  `last_login` int(10) unsigned DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_at` (`deleted_at`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Table structure for table `user_tokens`
--

CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `user_agent` varchar(40) NOT NULL,
  `token` varchar(40) NOT NULL,
  `created` int(10) unsigned NOT NULL,
  `expires` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `expires` (`expires`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


--
-- Table constraints defenitions
--

ALTER TABLE `prime_module_fieldsets`
  ADD CONSTRAINT `prime_module_fieldsets_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `prime_module_fieldsets` (`id`);

ALTER TABLE `prime_module_fieldset_items`
  ADD CONSTRAINT `prime_module_fieldset_items_ibfk_2` FOREIGN KEY (`prime_module_fieldset_id`) REFERENCES `prime_module_fieldsets` (`id`);

ALTER TABLE `prime_pages`
  ADD CONSTRAINT `prime_pages_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `prime_pages` (`id`);

ALTER TABLE `prime_regions`
  ADD CONSTRAINT `prime_regions_ibfk_2` FOREIGN KEY (`prime_module_id`) REFERENCES `prime_modules` (`id`),
  ADD CONSTRAINT `prime_regions_ibfk_1` FOREIGN KEY (`prime_page_id`) REFERENCES `prime_pages` (`id`);

ALTER TABLE `roles_users`
  ADD CONSTRAINT `roles_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `roles_users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);