CREATE TABLE public."ContentEntry" (
    "entryId" character varying(255),
    "versionId" uuid NOT NULL,
    "contentTypeId" uuid,
    "contentReleaseId" uuid,
    language character varying(255) DEFAULT 'en'::character varying,
    "isPublished" boolean,
    data json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."ContentRelease" (
    id uuid NOT NULL,
    name character varying(255),
    "publishAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."ContentType" (
    id uuid NOT NULL,
    name character varying(255),
    title character varying(255),
    "isSlice" boolean,
    groups jsonb
);

CREATE TABLE public."ContentTypeField" (
    id uuid NOT NULL,
    name character varying(255),
    title character varying(255),
    type character varying(255),
    "group" character varying(255) DEFAULT 'Main'::character varying,
    "position" integer DEFAULT 0,
    "contentTypeId" uuid,
    "contentTypeFieldId" uuid,
    options json
);

CREATE TABLE public."Navigation" (
    id uuid NOT NULL,
    "parentNavigationId" uuid,
    name character varying(255),
    "contentTypeId" uuid,
    "contentEntryId" uuid,
    "showEntries" boolean,
    index integer
);

CREATE TABLE public."Session" (
    sid character varying(36) NOT NULL,
    expires timestamp with time zone,
    data text
);

CREATE TABLE public."User" (
    id uuid NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    email character varying(255),
    password character varying(255),
    "lastLogin" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE ONLY public."ContentEntry"
    ADD CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("versionId");

ALTER TABLE ONLY public."ContentRelease"
    ADD CONSTRAINT "ContentRelease_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ContentTypeField"
    ADD CONSTRAINT "ContentTypeField_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ContentType"
    ADD CONSTRAINT "ContentType_name_key" UNIQUE (name);

ALTER TABLE ONLY public."ContentType"
    ADD CONSTRAINT "ContentType_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Navigation"
    ADD CONSTRAINT "Navigation_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (sid);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ContentEntry"
    ADD CONSTRAINT "ContentEntry_contentReleaseId_fkey" FOREIGN KEY ("contentReleaseId") REFERENCES public."ContentRelease"(id) ON UPDATE CASCADE;

ALTER TABLE ONLY public."ContentEntry"
    ADD CONSTRAINT "ContentEntry_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES public."ContentType"(id) ON UPDATE SET NULL ON DELETE SET NULL;

ALTER TABLE ONLY public."ContentTypeField"
    ADD CONSTRAINT "ContentTypeField_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES public."ContentType"(id) ON UPDATE CASCADE ON DELETE CASCADE;
