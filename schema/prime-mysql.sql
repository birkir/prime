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
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `resource_type` (`resource_type`),
  KEY `position`(`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `prime_modules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `controller` varchar(128) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(128) NOT NULL,
  `version` varchar(16) NOT NULL,
  `position` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `prime_modules` (`controller`, `slug`, `name`, `description`, `version`, `position`) VALUES
('Prime_Module_Fieldset_List', 'prime.fieldset.list', 'Fieldset List', 'Displays a list of items from the selected Fieldset List', '1.0', 3),
('Prime_Module_Fieldset_Insert', 'prime.fieldset.insert', 'Fieldset Insert', 'Displays an input form for entering data into the selected Fieldset List', '1.0', 5),
('Prime_Module_Fieldset_Item', 'prime.fieldset.item', 'Fieldset Item', 'Displays a single item from a Fieldset List', '1.0', 4),
('Prime_Module_Navigation', 'prime.navigation', 'Navigation', 'Displays the navigation of a website', '1.0', 0),
('Prime_Module_Html', 'prime.html', 'HTML Content', 'Allows free editing of HTML with WYSIWYG capabilities', '1.0', 1),
('Prime_Module_MultiView', 'prime.multiview', 'Multi View', 'Displays a control which can contain other content', '1.0', 2);

CREATE TABLE IF NOT EXISTS `prime_module_fieldsets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `position` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `prime_module_fieldset_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prime_module_fieldset_id` int(11) unsigned NOT NULL,
  `data` text NOT NULL,
  `position` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prime_module_fieldset_id` (`prime_module_fieldset_id`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `prime_pages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
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
  `gzip` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `position` int(11) unsigned NOT NULL,
  `visible` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `disabled` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `slug` (`slug`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `prime_regions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prime_page_id` int(11) unsigned NOT NULL,
  `prime_module_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `settings` text NOT NULL,
  `position` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `page_id` (`prime_page_id`),
  KEY `prime_module_id` (`prime_module_id`),
  KEY `position` (`position`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `roles` (`name`, `description`) VALUES
('login', 'Login role'),
('prime', 'Prime role');

CREATE TABLE IF NOT EXISTS `roles_users` (
  `user_id` int(10) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(64) NOT NULL,
  `data` text NOT NULL,
  `logins` int(10) unsigned NOT NULL DEFAULT '0',
  `last_login` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

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



---
--- Functions needed to parse JSON to columns, borrowed from common_schema
---

DELIMITER $$

DROP FUNCTION IF EXISTS unwrap $$
CREATE FUNCTION unwrap(txt TEXT CHARSET utf8) RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Unwraps a given text from braces'

begin
  if CHAR_LENGTH(txt) < 2 then
    return txt;
  end if;
  if LEFT(txt, 1) = '{' AND RIGHT(txt, 1) = '}' then
    return SUBSTRING(txt, 2, CHAR_LENGTH(txt) - 2);
  end if;
  if LEFT(txt, 1) = '[' AND RIGHT(txt, 1) = ']' then
    return SUBSTRING(txt, 2, CHAR_LENGTH(txt) - 2);
  end if;
  if LEFT(txt, 1) = '(' AND RIGHT(txt, 1) = ')' then
    return SUBSTRING(txt, 2, CHAR_LENGTH(txt) - 2);
  end if;
  return txt;
end $$

DELIMITER ;

---
---
---

DELIMITER $$

DROP FUNCTION IF EXISTS split_token $$
CREATE FUNCTION split_token(txt TEXT CHARSET utf8, delimiter_text VARCHAR(255) CHARSET utf8, token_index INT UNSIGNED) RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Return substring by index in delimited text'

begin
  if CHAR_LENGTH(delimiter_text) = '' then
    return SUBSTRING(txt, token_index, 1);
  else
    return SUBSTRING_INDEX(SUBSTRING_INDEX(txt, delimiter_text, token_index), delimiter_text, -1);
  end if;
end $$

DELIMITER ;

---
---
---

DELIMITER $$

DROP FUNCTION IF EXISTS trim_wspace $$
CREATE FUNCTION trim_wspace(txt TEXT CHARSET utf8) RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Trim whitespace characters on both sides'

begin
  declare len INT UNSIGNED DEFAULT 0;
  declare done TINYINT UNSIGNED DEFAULT 0;
  if txt IS NULL then
    return txt;
  end if;
  while not done do
    set len := CHAR_LENGTH(txt);
    set txt = trim(' ' FROM txt);
    set txt = trim('\r' FROM txt);
    set txt = trim('\n' FROM txt);
    set txt = trim('\t' FROM txt);
    set txt = trim('\b' FROM txt);
    if CHAR_LENGTH(txt) = len then
      set done := 1;
    end if;
  end while;
  return txt;
end $$

DELIMITER ;

---
---
---

DELIMITER $$

DROP FUNCTION IF EXISTS unquote $$
CREATE FUNCTION unquote(txt TEXT CHARSET utf8) RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Unquotes a given text'

begin
  declare quoting_char VARCHAR(1) CHARSET utf8;
  declare terminating_quote_escape_char VARCHAR(1) CHARSET utf8;
  declare current_pos INT UNSIGNED;
  declare end_quote_pos INT UNSIGNED;

  if CHAR_LENGTH(txt) < 2 then
    return txt;
  end if;
  
  set quoting_char := LEFT(txt, 1);
  if not quoting_char in ('''', '"', '`', '/') then
    return txt;
  end if;
  if txt in ('''''', '""', '``', '//') then
    return '';
  end if;
  
  set current_pos := 1;
  terminating_quote_loop: while current_pos > 0 do
    set current_pos := LOCATE(quoting_char, txt, current_pos + 1);
    if current_pos = 0 then
      -- No terminating quote
      return txt;
    end if;
    if SUBSTRING(txt, current_pos, 2) = REPEAT(quoting_char, 2) then
      set current_pos := current_pos + 1;
      iterate terminating_quote_loop;
    end if;
    set terminating_quote_escape_char := SUBSTRING(txt, current_pos - 1, 1);
    if (terminating_quote_escape_char = quoting_char) or (terminating_quote_escape_char = '\\') then
      -- This isn't really a quote end: the quote is escaped. 
      -- We do nothing; just a trivial assignment.
      iterate terminating_quote_loop;
    end if;
    -- Found terminating quote.
    leave terminating_quote_loop;
  end while;
  if current_pos = CHAR_LENGTH(txt) then
      return SUBSTRING(txt, 2, CHAR_LENGTH(txt) - 2);
    end if;
  return txt;
end $$

DELIMITER ;

---
---
---

DELIMITER $$

DROP FUNCTION IF EXISTS _retokenized_text $$
CREATE FUNCTION _retokenized_text(
  input_text TEXT CHARSET utf8, 
  delimiters VARCHAR(16) CHARSET utf8, 
  quoting_characters VARCHAR(16) CHARSET utf8,
  trim_tokens BOOL,
  empty_tokens_behavior enum('allow', 'skip', 'error')
) RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Retokenizes input_text with special token'

begin
  declare current_pos INT UNSIGNED DEFAULT 1;
  declare token_start_pos INT UNSIGNED DEFAULT 1;
  declare terminating_quote_found BOOL DEFAULT FALSE;
  declare terminating_quote_pos INT UNSIGNED DEFAULT 0;
  declare terminating_quote_escape_char CHAR(1) CHARSET utf8;
  declare current_char VARCHAR(1) CHARSET utf8;
  declare quoting_char VARCHAR(1) CHARSET utf8;
  declare current_token TEXT CHARSET utf8 DEFAULT '';
  declare result_text TEXT CHARSET utf8 DEFAULT '';
  declare delimiter_template VARCHAR(64) CHARSET ascii DEFAULT '\0[\n}\b+-\t|%&{])/\r~:;&"%`@>?=<_common_schema_unlikely_token_';
  declare internal_delimiter_length TINYINT UNSIGNED DEFAULT 0;
  declare internal_delimiter VARCHAR(64) CHARSET utf8 DEFAULT '';
  
  -- Resetting result delimiter; In case of error we want this to be an indicator
  set @common_schema_retokenized_delimiter := NULL;
  set @common_schema_retokenized_count := NULL;

  -- Detect a prefix of delimiter_template which can serve as a delimiter in the retokenized text,
  -- i.e. find a shortest delimiter which does not appear in the input text at all (hence can serve as
  -- a strictly tokenizing text, regardless of quotes)
  _evaluate_internal_delimiter_loop: while internal_delimiter_length < CHAR_LENGTH(delimiter_template) do
        set internal_delimiter_length := internal_delimiter_length + 1;
        set internal_delimiter := LEFT(delimiter_template, internal_delimiter_length);
        if LOCATE(internal_delimiter, input_text) = 0 then
          leave _evaluate_internal_delimiter_loop;
        end if;
  end while;

  while current_pos <= CHAR_LENGTH(input_text) + 1 do
    if current_pos = CHAR_LENGTH(input_text) + 1 then
      -- make sure a delimiter "exists" at the end of input_text, so as to gracefully parse
      -- the last token in list.
      set current_char := LEFT(delimiters, 1);
    else
      set current_char := SUBSTRING(input_text, current_pos, 1);
    end if;
    if LOCATE(current_char, quoting_characters) > 0 then
      -- going into string state: search for terminating quote.
      set quoting_char := current_char;
      set terminating_quote_found := false;
      while not terminating_quote_found do
        set terminating_quote_pos := LOCATE(quoting_char, input_text, current_pos + 1);
        if terminating_quote_pos = 0 then
          -- This is an error: non-terminated string!
          return NULL;
        end if;
        if terminating_quote_pos = current_pos + 1 then
          -- an empty text
          set terminating_quote_found := true;
        else
          -- We've gone some distance to find a possible terminating character. Is it really teminating,
          -- or is it escaped?
          set terminating_quote_escape_char := SUBSTRING(input_text, terminating_quote_pos - 1, 1);
          if (terminating_quote_escape_char = quoting_char) or (terminating_quote_escape_char = '\\') then
            -- This isn't really a quote end: the quote is escaped. 
            -- We do nothing; just a trivial assignment.
            set terminating_quote_found := false;        
          else
            set terminating_quote_found := true;            
          end if;
        end if;
        set current_pos := terminating_quote_pos;
      end while;
    elseif LOCATE(current_char, delimiters) > 0 then
      -- Found a delimiter (outside of quotes).
      set current_token := SUBSTRING(input_text, token_start_pos, current_pos - token_start_pos);
      if trim_tokens then
        set current_token := trim_wspace(current_token);
      end if;
      -- What of this token?
      if ((CHAR_LENGTH(current_token) = 0) and (empty_tokens_behavior = 'error')) then
        -- select `ERROR: _retokenized_text(): found empty token` FROM DUAL INTO @common_schema_error;
        return NULL;
      end if;
      if ((CHAR_LENGTH(current_token) > 0) or (empty_tokens_behavior = 'allow')) then
        -- Replace with internal token:
        if CHAR_LENGTH(result_text) > 0 then
          set result_text := CONCAT(result_text, internal_delimiter);
        end if;
        -- Finally, we note down the token:
        set result_text := CONCAT(result_text, current_token);
        set @common_schema_retokenized_count := 1 + IFNULL(@common_schema_retokenized_count, 0);
      end if;
      set token_start_pos := current_pos + 1;
    end if;
    set current_pos := current_pos + 1;
  end while;
  -- Unfortunately we cannot return two values from a function. One goes as
  -- user defined variable.
  -- @common_schema_retokenized_delimiter must be checked by calling code so
  -- as to determine how to further split text.
  set @common_schema_retokenized_delimiter := internal_delimiter;
  return result_text;
end $$

DELIMITER ;

---
---
---

DELIMITER $$

DROP FUNCTION IF EXISTS get_option $$
CREATE FUNCTION get_option(options TEXT CHARSET utf8, key_name VARCHAR(255) CHARSET utf8) 
  RETURNS TEXT CHARSET utf8 
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
COMMENT 'Return value of option in JS options format'

begin
  declare options_delimiter VARCHAR(64) CHARSET ascii DEFAULT NULL;
  declare num_options INT UNSIGNED DEFAULT 0;
  declare options_counter INT UNSIGNED DEFAULT 0;
  declare current_option TEXT CHARSET utf8 DEFAULT ''; 
  declare current_option_delimiter VARCHAR(64) CHARSET ascii DEFAULT NULL;
  declare current_key TEXT CHARSET utf8 DEFAULT ''; 
  declare current_value TEXT CHARSET utf8 DEFAULT ''; 

  if options is null then
    return null;
  end if;

  set key_name := unquote(key_name);

  -- parse options into key:value pairs
  set options := _retokenized_text(unwrap(trim_wspace(options)), ',', '"''`', TRUE, 'error');
  set options_delimiter := @common_schema_retokenized_delimiter;
  set num_options := @common_schema_retokenized_count;
  set options_counter := 1;
  while options_counter <= num_options do
    -- per option, parse key:value pair into key, value
    set current_option := split_token(options, options_delimiter, options_counter);
    set current_option = _retokenized_text(current_option, ':', '"''`', TRUE, 'error');

    set current_option_delimiter := @common_schema_retokenized_delimiter;
    if (@common_schema_retokenized_count != 2) then
      return NULL;
    end if;
    set current_key := split_token(current_option, current_option_delimiter, 1);
    set current_key := unquote(current_key);
    if current_key = key_name then
      set current_value := split_token(current_option, current_option_delimiter, 2);
      if current_value = 'NULL' then
        return NULL;
      end if;
      set current_value := unquote(current_value);
      return current_value;
    end if;
    set options_counter := options_counter + 1;
  end while;    
  return NULL;
end $$

DELIMITER ;