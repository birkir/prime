CREATE TABLE prime_fields
(
  id serial,
  resource_id integer NOT NULL,
  resource_type integer NOT NULL,
  "name" varchar(255) NOT NULL,
  caption varchar(255) NOT NULL,
  group varchar(255) NOT NULL,
  field varchar(255) NOT NULL,
  default varchar(255) NOT NULL,
  visible boolean NOT NULL DEFAULT '1',
  required boolean NOT NULL DEFAULT '0',
  options varchar(512) NOT NULL,
  position integer NOT NULL,
  CONSTRAINT prime_fields_id_pkey PRIMARY KEY (id)
);
