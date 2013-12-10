-- Converted by db_converter
START TRANSACTION;
SET standard_conforming_strings=off;
SET escape_string_warning=off;
SET CONSTRAINTS ALL DEFERRED;

CREATE TABLE "prime_fields" (
    "id" integer  NOT NULL,
    "resource_id" integer  NOT NULL,
    "resource_type" varchar(510) NOT NULL,
    "name" varchar(510) NOT NULL,
    "caption" varchar(510) NOT NULL,
    "group" varchar(510) NOT NULL,
    "field" varchar(510) NOT NULL,
    "default" varchar(510) NOT NULL,
    "visible" int4  NOT NULL DEFAULT '1',
    "required" int4  NOT NULL DEFAULT '0',
    "options" varchar(1024) NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    "published" bigint  DEFAULT NULL,
    "revision" bigint  DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("revision")
);

CREATE TABLE "prime_fields_rev" (
    "revision" bigint  NOT NULL,
    "id" integer  NOT NULL,
    "resource_id" integer  NOT NULL,
    "resource_type" varchar(510) NOT NULL,
    "name" varchar(510) NOT NULL,
    "caption" varchar(510) NOT NULL,
    "group" varchar(510) NOT NULL,
    "field" varchar(510) NOT NULL,
    "default" varchar(510) NOT NULL,
    "visible" int4  NOT NULL DEFAULT '1',
    "required" int4  NOT NULL DEFAULT '0',
    "options" varchar(1024) NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("revision")
);

CREATE TABLE "prime_files" (
    "id" integer  NOT NULL,
    "parent_id" integer  DEFAULT NULL,
    "name" varchar(510) NOT NULL,
    "slug" varchar(510) NOT NULL,
    "type" int4  NOT NULL DEFAULT '0',
    "ext" varchar(32) DEFAULT NULL,
    "mime" varchar(64) DEFAULT NULL,
    "size" bigint  DEFAULT NULL,
    "width" integer DEFAULT NULL,
    "height" integer DEFAULT NULL,
    "bits" varchar(32) DEFAULT NULL,
    "channels" varchar(32) DEFAULT NULL,
    "filename" varchar(510) NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "prime_module_fieldset_items" (
    "id" integer  NOT NULL,
    "prime_module_fieldset_id" integer  NOT NULL,
    "data" text NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    "published" bigint  DEFAULT NULL,
    "revision" bigint  DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("revision")
);

CREATE TABLE "prime_module_fieldset_items_rev" (
    "revision" bigint  NOT NULL,
    "id" integer  NOT NULL,
    "prime_module_fieldset_id" integer  NOT NULL,
    "data" text NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("revision")
);

CREATE TABLE "prime_module_fieldsets" (
    "id" integer  NOT NULL,
    "parent_id" integer  DEFAULT NULL,
    "name" varchar(510) NOT NULL,
    "type" int4  NOT NULL DEFAULT '0',
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "prime_modules" (
    "id" integer  NOT NULL,
    "controller" varchar(256) NOT NULL,
    "slug" varchar(510) DEFAULT NULL,
    "name" varchar(256) NOT NULL,
    "description" varchar(256) NOT NULL,
    "version" varchar(32) NOT NULL,
    "js" int4  NOT NULL DEFAULT '0',
    "position" integer  NOT NULL,
    PRIMARY KEY ("id")
);

INSERT INTO "prime_modules" VALUES
(1,'Prime_Module_Fieldset_List','prime.fieldset.list','Fieldset List','Displays a list of items from the selected Fieldset List','1.0',0,3),
(2,'Prime_Module_Fieldset_Insert','prime.fieldset.insert','Fieldset Insert','Displays an input form for entering data into the selected Fieldset List','1.0',0,5),
(3,'Prime_Module_Fieldset_Item','prime.fieldset.item','Fieldset Item','Displays a single item from a Fieldset List','1.0',0,4),
(4,'Prime_Module_Navigation','prime.navigation','Navigation','Displays the navigation of a website','1.0',0,0),
(5,'Prime_Module_Html','prime.html','HTML Content','Allows free editing of HTML with WYSIWYG capabilities','1.0',1,1),
(6,'Prime_Module_Multiview','prime.multiview','Multi View','Displays a control which can contain other content','1.0',0,2),
(7,'Prime_Module_Datasource','prime.datasource','Remote Data-Source','Get remote data from datasource. Includes authentication.','1.0',0,6),
(8,'Prime_Module_User_Signin','prime.user.signin','User Sign-in','Allows users to sign-in to the website.','1.0',0,7),
(9,'Prime_Module_User_Forgot','prime.user.forgot','User Forgot Password','Enables user to reset his password through email address.','1.0',0,8),
(10,'Prime_Module_User_Signup','prime.user.signup','User Sign Up','Allows users to sign-up to the website.','1.0',0,9),
(11,'Prime_Module_Search','prime.search','Search Results','Display search results for specified query string','1.0',0,10);

CREATE TABLE "prime_pages" (
    "id" integer  NOT NULL,
    "parent_id" integer  DEFAULT NULL,
    "language" varchar(32) NOT NULL DEFAULT 'en-us',
    "name" varchar(510) NOT NULL,
    "slug" varchar(510) NOT NULL,
    "slug_auto" int4  NOT NULL DEFAULT '1',
    "template" varchar(510) DEFAULT NULL,
    "properties" text NOT NULL,
    "description" varchar(510) NOT NULL,
    "keywords" varchar(510) NOT NULL,
    "noindex" int4  NOT NULL DEFAULT '0',
    "nofollow" int4  NOT NULL DEFAULT '0',
    "redirect" int4  NOT NULL DEFAULT '0',
    "redirect_url" varchar(510) DEFAULT NULL,
    "protocol" varchar(64) NOT NULL,
    "method" varchar(64) NOT NULL,
    "ajax" int4  NOT NULL DEFAULT '1',
    "visible" int4  NOT NULL DEFAULT '1',
    "disabled" int4  NOT NULL DEFAULT '0',
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    "published" bigint  DEFAULT NULL,
    "revision" bigint  DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("revision")
);

CREATE TABLE "prime_pages_rev" (
    "revision" bigint  NOT NULL,
    "id" integer  NOT NULL,
    "parent_id" integer  DEFAULT NULL,
    "language" varchar(32) NOT NULL DEFAULT 'en-us',
    "name" varchar(510) NOT NULL,
    "slug" varchar(510) NOT NULL,
    "slug_auto" int4  NOT NULL DEFAULT '1',
    "template" varchar(510) DEFAULT NULL,
    "properties" text NOT NULL,
    "description" varchar(510) NOT NULL,
    "keywords" varchar(510) NOT NULL,
    "noindex" int4  NOT NULL DEFAULT '0',
    "nofollow" int4  NOT NULL DEFAULT '0',
    "redirect" int4  NOT NULL DEFAULT '0',
    "redirect_url" varchar(510) DEFAULT NULL,
    "protocol" varchar(64) NOT NULL,
    "method" varchar(64) NOT NULL,
    "ajax" int4  NOT NULL DEFAULT '1',
    "visible" int4  NOT NULL DEFAULT '1',
    "disabled" int4  NOT NULL DEFAULT '0',
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("revision")
);

CREATE TABLE "prime_regions" (
    "id" integer  NOT NULL,
    "prime_page_id" integer  DEFAULT NULL,
    "prime_module_id" integer  NOT NULL,
    "sticky" int4  NOT NULL DEFAULT '0',
    "name" varchar(510) NOT NULL,
    "settings" text NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    "published" bigint  DEFAULT NULL,
    "revision" bigint  DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("revision")
);

CREATE TABLE "prime_regions_rev" (
    "revision" bigint  NOT NULL,
    "id" integer  NOT NULL,
    "prime_page_id" integer  DEFAULT NULL,
    "prime_module_id" integer  NOT NULL,
    "sticky" int4  NOT NULL DEFAULT '0',
    "name" varchar(510) NOT NULL,
    "settings" text NOT NULL,
    "position" integer  NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("revision")
);

CREATE TABLE "prime_urls" (
    "id" integer  NOT NULL,
    "uri" varchar(510) NOT NULL,
    "redirect_enabled" int4 NOT NULL DEFAULT '0',
    "redirect" varchar(510) DEFAULT NULL,
    "prime_page_id" integer  DEFAULT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("uri","deleted_at")
);

CREATE TABLE "roles" (
    "id" integer  NOT NULL,
    "name" varchar(64) NOT NULL,
    "description" varchar(510) NOT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("name")
);

INSERT INTO "roles" VALUES
(1,'login','Login role','2013-11-13 13:26:28',NULL,NULL),
(2,'prime','Prime role','2013-11-13 13:26:28',NULL,NULL);

CREATE TABLE "roles_users" (
    "user_id" integer  NOT NULL,
    "role_id" integer  NOT NULL,
    PRIMARY KEY ("user_id","role_id")
);

CREATE TABLE "user_tokens" (
    "id" integer  NOT NULL,
    "user_id" integer  NOT NULL,
    "user_agent" varchar(80) NOT NULL,
    "token" varchar(80) NOT NULL,
    "created" integer  NOT NULL,
    "expires" integer  NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("token")
);

CREATE TABLE "users" (
    "id" integer  NOT NULL,
    "fullname" varchar(510) DEFAULT NULL,
    "email" varchar(508) NOT NULL,
    "password" varchar(128) NOT NULL,
    "data" text NOT NULL,
    "logins" integer  NOT NULL DEFAULT '0',
    "language" varchar(32) NOT NULL DEFAULT 'en-us',
    "last_login" integer  DEFAULT NULL,
    "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer  DEFAULT NULL,
    "deleted_at" timestamp with time zone DEFAULT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("email")
);

-- Post-data save --
COMMIT;
START TRANSACTION;

-- Typecasts --
ALTER TABLE "prime_fields" ALTER COLUMN "visible" DROP DEFAULT, ALTER COLUMN "visible" TYPE boolean USING CAST("visible" as boolean);
ALTER TABLE "prime_fields" ALTER COLUMN "required" DROP DEFAULT, ALTER COLUMN "required" TYPE boolean USING CAST("required" as boolean);
ALTER TABLE "prime_fields_rev" ALTER COLUMN "visible" DROP DEFAULT, ALTER COLUMN "visible" TYPE boolean USING CAST("visible" as boolean);
ALTER TABLE "prime_fields_rev" ALTER COLUMN "required" DROP DEFAULT, ALTER COLUMN "required" TYPE boolean USING CAST("required" as boolean);
ALTER TABLE "prime_files" ALTER COLUMN "type" DROP DEFAULT, ALTER COLUMN "type" TYPE boolean USING CAST("type" as boolean);
ALTER TABLE "prime_module_fieldsets" ALTER COLUMN "type" DROP DEFAULT, ALTER COLUMN "type" TYPE boolean USING CAST("type" as boolean);
ALTER TABLE "prime_modules" ALTER COLUMN "js" DROP DEFAULT, ALTER COLUMN "js" TYPE boolean USING CAST("js" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "slug_auto" DROP DEFAULT, ALTER COLUMN "slug_auto" TYPE boolean USING CAST("slug_auto" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "noindex" DROP DEFAULT, ALTER COLUMN "noindex" TYPE boolean USING CAST("noindex" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "nofollow" DROP DEFAULT, ALTER COLUMN "nofollow" TYPE boolean USING CAST("nofollow" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "redirect" DROP DEFAULT, ALTER COLUMN "redirect" TYPE boolean USING CAST("redirect" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "ajax" DROP DEFAULT, ALTER COLUMN "ajax" TYPE boolean USING CAST("ajax" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "visible" DROP DEFAULT, ALTER COLUMN "visible" TYPE boolean USING CAST("visible" as boolean);
ALTER TABLE "prime_pages" ALTER COLUMN "disabled" DROP DEFAULT, ALTER COLUMN "disabled" TYPE boolean USING CAST("disabled" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "slug_auto" DROP DEFAULT, ALTER COLUMN "slug_auto" TYPE boolean USING CAST("slug_auto" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "noindex" DROP DEFAULT, ALTER COLUMN "noindex" TYPE boolean USING CAST("noindex" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "nofollow" DROP DEFAULT, ALTER COLUMN "nofollow" TYPE boolean USING CAST("nofollow" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "redirect" DROP DEFAULT, ALTER COLUMN "redirect" TYPE boolean USING CAST("redirect" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "ajax" DROP DEFAULT, ALTER COLUMN "ajax" TYPE boolean USING CAST("ajax" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "visible" DROP DEFAULT, ALTER COLUMN "visible" TYPE boolean USING CAST("visible" as boolean);
ALTER TABLE "prime_pages_rev" ALTER COLUMN "disabled" DROP DEFAULT, ALTER COLUMN "disabled" TYPE boolean USING CAST("disabled" as boolean);
ALTER TABLE "prime_regions" ALTER COLUMN "sticky" DROP DEFAULT, ALTER COLUMN "sticky" TYPE boolean USING CAST("sticky" as boolean);
ALTER TABLE "prime_regions_rev" ALTER COLUMN "sticky" DROP DEFAULT, ALTER COLUMN "sticky" TYPE boolean USING CAST("sticky" as boolean);
ALTER TABLE "prime_urls" ALTER COLUMN "redirect_enabled" DROP DEFAULT, ALTER COLUMN "redirect_enabled" TYPE boolean USING CAST("redirect_enabled" as boolean);

-- Foreign keys --
ALTER TABLE "prime_module_fieldset_items" ADD CONSTRAINT "prime_module_fieldset_items_ibfk_2" FOREIGN KEY ("prime_module_fieldset_id") REFERENCES "prime_module_fieldsets" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "prime_module_fieldset_items" ("prime_module_fieldset_id");
ALTER TABLE "prime_module_fieldsets" ADD CONSTRAINT "prime_module_fieldsets_ibfk_1" FOREIGN KEY ("parent_id") REFERENCES "prime_module_fieldsets" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "prime_module_fieldsets" ("parent_id");
ALTER TABLE "prime_pages" ADD CONSTRAINT "prime_pages_ibfk_1" FOREIGN KEY ("parent_id") REFERENCES "prime_pages" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "prime_pages" ("parent_id");
ALTER TABLE "roles_users" ADD CONSTRAINT "roles_users_ibfk_4" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "roles_users" ("role_id");
ALTER TABLE "roles_users" ADD CONSTRAINT "roles_users_ibfk_3" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "roles_users" ("user_id");
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_ibfk_2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX ON "user_tokens" ("user_id");

-- Sequences --
CREATE SEQUENCE prime_fields_id_seq;
SELECT setval('prime_fields_id_seq', max(id)) FROM prime_fields;
ALTER TABLE "prime_fields" ALTER COLUMN "id" SET DEFAULT nextval('prime_fields_id_seq');
CREATE SEQUENCE prime_fields_rev_id_seq;
SELECT setval('prime_fields_rev_id_seq', max(id)) FROM prime_fields_rev;
ALTER TABLE "prime_fields_rev" ALTER COLUMN "id" SET DEFAULT nextval('prime_fields_rev_id_seq');
CREATE SEQUENCE prime_files_id_seq;
SELECT setval('prime_files_id_seq', max(id)) FROM prime_files;
ALTER TABLE "prime_files" ALTER COLUMN "id" SET DEFAULT nextval('prime_files_id_seq');
CREATE SEQUENCE prime_module_fieldset_items_id_seq;
SELECT setval('prime_module_fieldset_items_id_seq', max(id)) FROM prime_module_fieldset_items;
ALTER TABLE "prime_module_fieldset_items" ALTER COLUMN "id" SET DEFAULT nextval('prime_module_fieldset_items_id_seq');
CREATE SEQUENCE prime_module_fieldset_items_rev_id_seq;
SELECT setval('prime_module_fieldset_items_rev_id_seq', max(id)) FROM prime_module_fieldset_items_rev;
ALTER TABLE "prime_module_fieldset_items_rev" ALTER COLUMN "id" SET DEFAULT nextval('prime_module_fieldset_items_rev_id_seq');
CREATE SEQUENCE prime_module_fieldsets_id_seq;
SELECT setval('prime_module_fieldsets_id_seq', max(id)) FROM prime_module_fieldsets;
ALTER TABLE "prime_module_fieldsets" ALTER COLUMN "id" SET DEFAULT nextval('prime_module_fieldsets_id_seq');
CREATE SEQUENCE prime_modules_id_seq;
SELECT setval('prime_modules_id_seq', max(id)) FROM prime_modules;
ALTER TABLE "prime_modules" ALTER COLUMN "id" SET DEFAULT nextval('prime_modules_id_seq');
CREATE SEQUENCE prime_pages_id_seq;
SELECT setval('prime_pages_id_seq', max(id)) FROM prime_pages;
ALTER TABLE "prime_pages" ALTER COLUMN "id" SET DEFAULT nextval('prime_pages_id_seq');
CREATE SEQUENCE prime_pages_rev_id_seq;
SELECT setval('prime_pages_rev_id_seq', max(id)) FROM prime_pages_rev;
ALTER TABLE "prime_pages_rev" ALTER COLUMN "id" SET DEFAULT nextval('prime_pages_rev_id_seq');
CREATE SEQUENCE prime_regions_id_seq;
SELECT setval('prime_regions_id_seq', max(id)) FROM prime_regions;
ALTER TABLE "prime_regions" ALTER COLUMN "id" SET DEFAULT nextval('prime_regions_id_seq');
CREATE SEQUENCE prime_regions_rev_id_seq;
SELECT setval('prime_regions_rev_id_seq', max(id)) FROM prime_regions_rev;
ALTER TABLE "prime_regions_rev" ALTER COLUMN "id" SET DEFAULT nextval('prime_regions_rev_id_seq');
CREATE SEQUENCE prime_urls_id_seq;
SELECT setval('prime_urls_id_seq', max(id)) FROM prime_urls;
ALTER TABLE "prime_urls" ALTER COLUMN "id" SET DEFAULT nextval('prime_urls_id_seq');
CREATE SEQUENCE roles_id_seq;
SELECT setval('roles_id_seq', max(id)) FROM roles;
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT nextval('roles_id_seq');
CREATE SEQUENCE user_tokens_id_seq;
SELECT setval('user_tokens_id_seq', max(id)) FROM user_tokens;
ALTER TABLE "user_tokens" ALTER COLUMN "id" SET DEFAULT nextval('user_tokens_id_seq');
CREATE SEQUENCE users_id_seq;
SELECT setval('users_id_seq', max(id)) FROM users;
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq');

COMMIT;