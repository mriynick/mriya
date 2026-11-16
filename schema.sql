--
-- PostgreSQL database dump
--



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: askmr_obmezh_vidpovid(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.askmr_obmezh_vidpovid() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE pyt public.askmr_pytannia%ROWTYPE;kilkist bigint;
BEGIN
SELECT * INTO pyt FROM public.askmr_pytannia WHERE id=NEW.pytannia_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'askmr_missing' USING ERRCODE='23503';END IF;
SELECT count(*) INTO kilkist FROM public.askmr_vidpovidi WHERE pytannia_id=NEW.pytannia_id;
IF pyt.zakryto OR (pyt.zavershennia IS NOT NULL AND pyt.zavershennia<=clock_timestamp()) OR (pyt.maks_vidpovidei>0 AND kilkist>=pyt.maks_vidpovidei) THEN RAISE EXCEPTION 'askmr_closed' USING ERRCODE='P0001';END IF;
IF pyt.maks_vidpovidei>0 AND kilkist+1>=pyt.maks_vidpovidei THEN UPDATE public.askmr_pytannia SET zakryto=true WHERE id=NEW.pytannia_id;END IF;
RETURN NEW;
END
$$;


--
-- Name: cmc(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cmc() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
IF TG_OP='INSERT' THEN
IF NOT NEW.del THEN UPDATE public.posts SET skilki_commentariv=GREATEST(0,COALESCE(skilki_commentariv,0)+1) WHERE id=NEW.pid; END IF;
RETURN NEW;
ELSIF TG_OP='DELETE' THEN
IF NOT OLD.del THEN UPDATE public.posts SET skilki_commentariv=GREATEST(0,COALESCE(skilki_commentariv,0)-1) WHERE id=OLD.pid; END IF;
RETURN OLD;
ELSE
IF OLD.del IS DISTINCT FROM NEW.del THEN UPDATE public.posts SET skilki_commentariv=GREATEST(0,COALESCE(skilki_commentariv,0)+CASE WHEN NEW.del THEN -1 ELSE 1 END) WHERE id=NEW.pid; END IF;
RETURN NEW;
END IF;
END;
$$;


--
-- Name: pbextras_join_guard(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pbextras_join_guard() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE owner integer;
BEGIN
SELECT owner_id INTO owner FROM public.pabliks WHERE id=NEW.cid FOR UPDATE;
IF NEW.uid<>owner AND EXISTS(SELECT 1 FROM public.pablik_extras WHERE cid=NEW.cid AND join_closed) AND NOT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=NEW.cid AND uid=NEW.uid) THEN RAISE EXCEPTION 'вступ тимчасово закрито'; END IF;
RETURN NEW;
END;
$$;


--
-- Name: pbextras_pin_guard(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pbextras_pin_guard() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
IF NEW.pinned_post_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.pablik_posts WHERE id=NEW.pinned_post_id AND cid=NEW.cid) THEN RAISE EXCEPTION 'невірний допис'; END IF;
RETURN NEW;
END;
$$;


--
-- Name: pbm(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pbm() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE ow INTEGER;
ct INTEGER;
mx INTEGER;
BEGIN
IF TG_OP='INSERT' THEN
SELECT owner_id,member_count,max_members INTO ow,ct,mx FROM public.pabliks WHERE id=NEW.cid FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'спільноту не знайдено'; END IF;
IF EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=NEW.cid AND uid=NEW.uid) THEN RETURN NEW; END IF;
IF ct>=mx THEN RAISE EXCEPTION 'у спільноті немає вільних місць'; END IF;
UPDATE public.pabliks SET member_count=member_count+1 WHERE id=NEW.cid;
RETURN NEW;
ELSIF TG_OP='UPDATE' THEN
IF NEW.cid<>OLD.cid OR NEW.uid<>OLD.uid THEN RAISE EXCEPTION 'не можна змінювати учасника'; END IF;
RETURN NEW;
ELSE
SELECT owner_id INTO ow FROM public.pabliks WHERE id=OLD.cid FOR UPDATE;
IF FOUND AND ow=OLD.uid AND EXISTS(SELECT 1 FROM public.useri WHERE id=ow) THEN RAISE EXCEPTION 'власник не може вийти зі спільноти'; END IF;
UPDATE public.pabliks SET member_count=GREATEST(0,member_count-1) WHERE id=OLD.cid;
RETURN OLD;
END IF;
END;
$$;


--
-- Name: pbo(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pbo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
IF TG_OP='UPDATE' THEN
IF NEW.owner_id<>OLD.owner_id AND (COALESCE(current_setting('mriya.transfer_community',true),'')<>OLD.id::text||':'||OLD.owner_id::text||':'||NEW.owner_id::text OR NOT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=OLD.id AND uid=NEW.owner_id)) THEN RAISE EXCEPTION 'власника спільноти не можна змінити'; END IF;
RETURN NEW;
END IF;
INSERT INTO public.pablik_members(cid,uid) VALUES(NEW.id,NEW.owner_id) ON CONFLICT DO NOTHING;
RETURN NEW;
END;
$$;


--
-- Name: pbp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pbp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE ow INTEGER;
pm TEXT;
im TEXT;
BEGIN
IF TG_OP='UPDATE' AND (NEW.cid<>OLD.cid OR NEW.avtor_id<>OLD.avtor_id) THEN RAISE EXCEPTION 'автора та спільноту допису не можна змінити'; END IF;
IF TG_OP='INSERT' THEN
SELECT owner_id,posting INTO ow,pm FROM public.pabliks WHERE id=NEW.cid FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'спільноту не знайдено'; END IF;
IF NEW.avtor_id<>ow AND (NOT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=NEW.cid AND uid=NEW.avtor_id) OR EXISTS(SELECT 1 FROM public.pablik_write_blocks b WHERE b.cid=NEW.cid AND b.uid=NEW.avtor_id)) THEN RAISE EXCEPTION 'немає права публікувати'; END IF;
IF NEW.avtor_id<>ow AND pm<>'all' AND NOT EXISTS(SELECT 1 FROM public.pablik_suggestions s WHERE s.id::text=COALESCE(current_setting('mriya.accepting_suggestion',true),'') AND s.status='pending' AND s.cid=NEW.cid AND s.avtor_id=NEW.avtor_id AND s.text=NEW.text AND s.pics=NEW.pics AND s.gif=NEW.gif AND s.geo=NEW.geo) THEN RAISE EXCEPTION 'немає права публікувати'; END IF;
END IF;
FOREACH im IN ARRAY NEW.pics LOOP
IF im IS NULL OR im NOT LIKE '/uploads/%' THEN RAISE EXCEPTION 'невірне фото'; END IF;
END LOOP;
IF TG_OP='UPDATE' THEN NEW.zredagovano=TRUE; NEW.zkoli=NOW(); END IF;
RETURN NEW;
END;
$$;


--
-- Name: video_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.video_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
k BIGINT;
a INTEGER:=0;
b INTEGER:=0;
c INTEGER:=0;
d INTEGER:=0;
e INTEGER:=0;
f INTEGER:=0;
n INTEGER:=0;
BEGIN
IF TG_OP='UPDATE' AND OLD.vid<>NEW.vid THEN RAISE EXCEPTION 'video identity is immutable'; END IF;
IF TG_OP='DELETE' THEN k:=OLD.vid; ELSE k:=NEW.vid; END IF;
IF TG_OP='INSERT' THEN n:=1; ELSIF TG_OP='DELETE' THEN n:=-1; END IF;
IF TG_TABLE_NAME='video_reactions' THEN
IF TG_OP<>'INSERT' THEN a:=a-(OLD.reaction=1)::INTEGER; b:=b-(OLD.reaction=-1)::INTEGER; END IF;
IF TG_OP<>'DELETE' THEN a:=a+(NEW.reaction=1)::INTEGER; b:=b+(NEW.reaction=-1)::INTEGER; END IF;
ELSIF TG_TABLE_NAME='video_reposts' THEN c:=n;
ELSIF TG_TABLE_NAME='video_shares' THEN d:=n;
ELSIF TG_TABLE_NAME='video_views' THEN e:=n;
ELSIF TG_TABLE_NAME='video_comments' THEN f:=n;
END IF;
UPDATE public.videos SET laiki=laiki+a,dislaiki=dislaiki+b,reposts=reposts+c,shared=shared+d,viewz=viewz+e,skilki_commentariv=skilki_commentariv+f WHERE id=k;
RETURN NULL;
END;
$$;


--
-- Name: video_touch(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.video_touch() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
NEW.rev:=OLD.rev+1;
NEW.updated_at:=NOW();
RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: askmr_krashchi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.askmr_krashchi (
    pytannia_id integer NOT NULL,
    vidpovid_id integer NOT NULL
);


--
-- Name: askmr_pytannia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.askmr_pytannia (
    id integer NOT NULL,
    avtor_id integer NOT NULL,
    nazva text NOT NULL,
    tekst text DEFAULT ''::text NOT NULL,
    fotky text[] DEFAULT '{}'::text[] NOT NULL,
    vazhlyvist smallint DEFAULT 0 NOT NULL,
    katehoriia text NOT NULL,
    stvoreno timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    zmineno timestamp with time zone,
    zakryto boolean DEFAULT false NOT NULL,
    zavershennia timestamp with time zone,
    maks_vidpovidei integer DEFAULT 0 NOT NULL,
    CONSTRAINT askmr_pytannia_check CHECK (((btrim(tekst) <> ''::text) OR (cardinality(fotky) > 0))),
    CONSTRAINT askmr_pytannia_fotky_check CHECK ((cardinality(fotky) <= 5)),
    CONSTRAINT askmr_pytannia_katehoriia_check CHECK ((katehoriia = ANY (ARRAY['tekhnolohii'::text, 'muzyka'::text, 'ihry'::text, 'filmy'::text, 'osvita'::text, 'nauka'::text, 'zdorovia'::text, 'sport'::text, 'podorozhi'::text, 'pobut'::text, 'kulinariia'::text, 'tvorchist'::text, 'stosunky'::text, 'mriya'::text, 'inshe'::text]))),
    CONSTRAINT askmr_pytannia_maks_vidpovidei_check CHECK (((maks_vidpovidei >= 0) AND (maks_vidpovidei <= 1000))),
    CONSTRAINT askmr_pytannia_nazva_check CHECK (((char_length(btrim(nazva)) >= 1) AND (char_length(btrim(nazva)) <= 200))),
    CONSTRAINT askmr_pytannia_tekst_check CHECK ((char_length(tekst) <= 20000)),
    CONSTRAINT askmr_pytannia_vazhlyvist_check CHECK (((vazhlyvist >= 0) AND (vazhlyvist <= 3)))
);


--
-- Name: askmr_pytannia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.askmr_pytannia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: askmr_pytannia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.askmr_pytannia_id_seq OWNED BY public.askmr_pytannia.id;


--
-- Name: askmr_vidpovidi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.askmr_vidpovidi (
    id integer NOT NULL,
    pytannia_id integer NOT NULL,
    avtor_id integer NOT NULL,
    tekst text DEFAULT ''::text NOT NULL,
    fotky text[] DEFAULT '{}'::text[] NOT NULL,
    stvoreno timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    zmineno timestamp with time zone,
    CONSTRAINT askmr_vidpovidi_check CHECK (((btrim(tekst) <> ''::text) OR (cardinality(fotky) > 0))),
    CONSTRAINT askmr_vidpovidi_fotky_check CHECK ((cardinality(fotky) <= 5)),
    CONSTRAINT askmr_vidpovidi_tekst_check CHECK ((char_length(tekst) <= 10000))
);


--
-- Name: askmr_vidpovidi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.askmr_vidpovidi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: askmr_vidpovidi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.askmr_vidpovidi_id_seq OWNED BY public.askmr_vidpovidi.id;


--
-- Name: auth_mail_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_mail_codes (
    token_hash text NOT NULL,
    uid integer NOT NULL,
    purpose text NOT NULL,
    code_mac text NOT NULL,
    email text NOT NULL,
    credential_hash text NOT NULL,
    auth_version bigint NOT NULL,
    payload text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    ready boolean DEFAULT false NOT NULL,
    CONSTRAINT auth_mail_codes_attempts_check CHECK (((attempts >= 0) AND (attempts <= 5))),
    CONSTRAINT auth_mail_codes_code_mac_check CHECK ((length(code_mac) = 64)),
    CONSTRAINT auth_mail_codes_purpose_check CHECK ((purpose = ANY (ARRAY['login'::text, 'password'::text, '2fa'::text]))),
    CONSTRAINT auth_mail_codes_token_hash_check CHECK ((length(token_hash) = 64))
);


--
-- Name: auth_mail_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_mail_limits (
    bucket text NOT NULL,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    n integer DEFAULT 1 NOT NULL,
    last_sent timestamp with time zone
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    pid integer NOT NULL,
    uid integer NOT NULL,
    rid integer,
    text text DEFAULT ''::text NOT NULL,
    pics text[] DEFAULT '{}'::text[] NOT NULL,
    gif text DEFAULT ''::text NOT NULL,
    geo text DEFAULT ''::text NOT NULL,
    ca timestamp with time zone DEFAULT now() NOT NULL,
    ua timestamp with time zone,
    del boolean DEFAULT false NOT NULL,
    CONSTRAINT comments_check CHECK (((rid IS NULL) OR (rid <> id))),
    CONSTRAINT comments_geo_check CHECK ((char_length(geo) <= 100)),
    CONSTRAINT comments_text_check CHECK ((char_length(text) <= 5000))
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: druzi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.druzi (
    id bigint NOT NULL,
    first_id integer NOT NULL,
    second_id integer NOT NULL,
    status text DEFAULT 'waiting'::text NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    accepted_at timestamp with time zone,
    first_seen_at timestamp with time zone,
    second_seen_at timestamp with time zone,
    CONSTRAINT druzi_check CHECK (((first_id > 0) AND (second_id > 0) AND (first_id <> second_id))),
    CONSTRAINT druzi_check1 CHECK ((((status = 'waiting'::text) AND (accepted_at IS NULL)) OR ((status = 'priynato'::text) AND (accepted_at IS NOT NULL)))),
    CONSTRAINT druzi_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'priynato'::text])))
);


--
-- Name: druzi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.druzi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: druzi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.druzi_id_seq OWNED BY public.druzi.id;


--
-- Name: flash; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flash (
    id integer NOT NULL,
    uid integer,
    na text NOT NULL,
    fl text NOT NULL,
    ca timestamp with time zone DEFAULT now(),
    vw integer DEFAULT 0,
    lk integer DEFAULT 0
);


--
-- Name: flash_acts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flash_acts (
    id integer NOT NULL,
    fid integer,
    uid integer,
    typ character varying(20)
);


--
-- Name: flash_acts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flash_acts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flash_acts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flash_acts_id_seq OWNED BY public.flash_acts.id;


--
-- Name: flash_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flash_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flash_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flash_id_seq OWNED BY public.flash.id;


--
-- Name: flash_lk; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flash_lk (
    fid integer,
    uid integer
);


--
-- Name: galki; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.galki (
    uid integer NOT NULL,
    pic text NOT NULL,
    label text DEFAULT ''::text NOT NULL,
    CONSTRAINT galki_pic_check CHECK (((btrim(pic) <> ''::text) AND (pic !~ '[/\\]'::text)))
);


--
-- Name: hostingsites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hostingsites (
    id integer NOT NULL,
    uid integer NOT NULL,
    nazva text NOT NULL,
    opis text DEFAULT ''::text NOT NULL,
    adres text NOT NULL,
    dir text NOT NULL,
    link text NOT NULL,
    faily jsonb DEFAULT '[]'::jsonb NOT NULL,
    obsiag integer DEFAULT 0 NOT NULL,
    stvoreno timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    zmineno timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    CONSTRAINT hostingsites_adres_check CHECK (((adres ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'::text) AND (adres !~~ 'xn--%'::text))),
    CONSTRAINT hostingsites_check CHECK ((link = (('/'::text || adres) || '.ink/'::text))),
    CONSTRAINT hostingsites_dir_check CHECK (((dir = 'pending'::text) OR (dir ~ '^[1-9][0-9]*/[a-f0-9]{32}$'::text))),
    CONSTRAINT hostingsites_faily_check CHECK (((jsonb_typeof(faily) = 'array'::text) AND (jsonb_array_length(faily) <= 50))),
    CONSTRAINT hostingsites_nazva_check CHECK (((char_length(btrim(nazva)) >= 1) AND (char_length(btrim(nazva)) <= 120))),
    CONSTRAINT hostingsites_obsiag_check CHECK (((obsiag >= 0) AND (obsiag <= 26214400))),
    CONSTRAINT hostingsites_opis_check CHECK ((char_length(opis) <= 2000))
);


--
-- Name: hostingsites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hostingsites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hostingsites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hostingsites_id_seq OWNED BY public.hostingsites.id;


--
-- Name: invgalki; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invgalki (
    uid integer NOT NULL,
    pic text NOT NULL,
    label text DEFAULT ''::text NOT NULL,
    CONSTRAINT invgalki_pic_check CHECK (((btrim(pic) <> ''::text) AND (pic !~ '[/\\]'::text)))
);


--
-- Name: mriya_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mriya_reports (
    id bigint NOT NULL,
    author_id integer,
    kind text NOT NULL,
    target_id bigint NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    target_version text NOT NULL,
    request_key uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reason text DEFAULT ''::text NOT NULL,
    reviewer_id integer,
    reviewer_name text DEFAULT ''::text NOT NULL,
    reviewed_version text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT mriya_reports_body_check CHECK (((char_length(btrim(body)) >= 1) AND (char_length(btrim(body)) <= 5000))),
    CONSTRAINT mriya_reports_check CHECK (((status <> 'pending'::text) OR ((resolved_at IS NULL) AND (reviewer_id IS NULL)))),
    CONSTRAINT mriya_reports_check1 CHECK (((status <> 'rejected'::text) OR (char_length(btrim(reason)) > 0))),
    CONSTRAINT mriya_reports_check2 CHECK (((author_id IS NULL) OR (reviewer_id IS NULL) OR (author_id <> reviewer_id))),
    CONSTRAINT mriya_reports_kind_check CHECK ((kind = ANY (ARRAY['post'::text, 'comment'::text, 'flash'::text, 'community'::text, 'community_post'::text, 'suggestion'::text, 'music'::text, 'video'::text, 'video_comment'::text, 'site'::text]))),
    CONSTRAINT mriya_reports_reason_check CHECK ((char_length(reason) <= 2000)),
    CONSTRAINT mriya_reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]))),
    CONSTRAINT mriya_reports_target_id_check CHECK (((target_id > 0) AND (target_id <= '9007199254740991'::bigint))),
    CONSTRAINT mriya_reports_target_version_check CHECK ((target_version ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT mriya_reports_title_check CHECK (((char_length(btrim(title)) >= 1) AND (char_length(btrim(title)) <= 160)))
);


--
-- Name: mriya_reports_gc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mriya_reports_gc (
    id bigint NOT NULL,
    kind text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    CONSTRAINT mriya_reports_gc_kind_check CHECK ((kind = ANY (ARRAY['music'::text, 'video_src'::text, 'video_out'::text, 'video_preview'::text, 'site'::text])))
);


--
-- Name: mriya_reports_gc_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mriya_reports_gc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mriya_reports_gc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mriya_reports_gc_id_seq OWNED BY public.mriya_reports_gc.id;


--
-- Name: mriya_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mriya_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mriya_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mriya_reports_id_seq OWNED BY public.mriya_reports.id;


--
-- Name: music; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.music (
    id bigint NOT NULL,
    nazva character varying(160) NOT NULL,
    failik text NOT NULL,
    genre character varying(24) NOT NULL,
    uploader integer NOT NULL,
    author character varying(160) NOT NULL,
    albom character varying(160) DEFAULT ''::character varying NOT NULL,
    godvipuska smallint,
    opis text DEFAULT ''::text NOT NULL,
    CONSTRAINT music_author_check CHECK ((btrim((author)::text) <> ''::text)),
    CONSTRAINT music_failik_check CHECK (((btrim(failik) <> ''::text) AND (char_length(failik) <= 2048))),
    CONSTRAINT music_genre_check CHECK (((genre)::text = ANY ((ARRAY['pop'::character varying, 'rock'::character varying, 'hiphop'::character varying, 'electronic'::character varying, 'house'::character varying, 'techno'::character varying, 'dnb'::character varying, 'dubstep'::character varying, 'trance'::character varying, 'ambient'::character varying, 'jazz'::character varying, 'blues'::character varying, 'soul'::character varying, 'funk'::character varying, 'disco'::character varying, 'rnb'::character varying, 'reggae'::character varying, 'country'::character varying, 'folk'::character varying, 'classical'::character varying, 'metal'::character varying, 'punk'::character varying, 'indie'::character varying, 'soundtrack'::character varying])::text[]))),
    CONSTRAINT music_godvipuska_check CHECK (((godvipuska >= 1000) AND (godvipuska <= 9999))),
    CONSTRAINT music_nazva_check CHECK ((btrim((nazva)::text) <> ''::text)),
    CONSTRAINT music_opis_check CHECK ((char_length(opis) <= 5000))
);


--
-- Name: music_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.music_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: music_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.music_id_seq OWNED BY public.music.id;


--
-- Name: native_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.native_files (
    kind text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: native_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.native_settings (
    uid integer NOT NULL,
    hidden boolean DEFAULT false NOT NULL
);


--
-- Name: noti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.noti (
    id integer NOT NULL,
    uid integer,
    actor_id integer,
    pid integer,
    typ character varying(20),
    rd boolean DEFAULT false,
    ca timestamp with time zone DEFAULT now()
);


--
-- Name: noti_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.noti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: noti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.noti_id_seq OWNED BY public.noti.id;


--
-- Name: pablik_acts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_acts (
    pid integer NOT NULL,
    uid integer NOT NULL,
    typ text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pablik_acts_typ_check CHECK ((typ = ANY (ARRAY['like'::text, 'dislike'::text, 'repost'::text, 'share'::text, 'view'::text])))
);


--
-- Name: pablik_extras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_extras (
    cid integer NOT NULL,
    pinned_post_id integer,
    join_closed boolean DEFAULT false NOT NULL,
    welcome text DEFAULT ''::text NOT NULL,
    CONSTRAINT pablik_extras_welcome_check CHECK ((char_length(welcome) <= 500))
);


--
-- Name: pablik_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_members (
    cid integer NOT NULL,
    uid integer NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pablik_post_identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_post_identity (
    pid integer NOT NULL
);


--
-- Name: pablik_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_posts (
    id integer NOT NULL,
    cid integer NOT NULL,
    avtor_id integer NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    pics text[] DEFAULT '{}'::text[] NOT NULL,
    gif text DEFAULT ''::text NOT NULL,
    geo text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    zredagovano boolean DEFAULT false NOT NULL,
    zkoli timestamp with time zone,
    mx_coauthor_id integer,
    CONSTRAINT pablik_posts_check CHECK (((btrim(text) <> ''::text) OR (cardinality(pics) > 0) OR (gif <> ''::text))),
    CONSTRAINT pablik_posts_geo_check CHECK ((char_length(geo) <= 100)),
    CONSTRAINT pablik_posts_gif_check CHECK (((gif = ''::text) OR (gif ~~ '/uploads/%'::text))),
    CONSTRAINT pablik_posts_pics_check CHECK ((cardinality(pics) <= 5)),
    CONSTRAINT pablik_posts_text_check CHECK ((char_length(text) <= 5000))
);


--
-- Name: pablik_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pablik_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pablik_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pablik_posts_id_seq OWNED BY public.pablik_posts.id;


--
-- Name: pablik_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_suggestions (
    id integer NOT NULL,
    cid integer NOT NULL,
    avtor_id integer NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    pics text[] DEFAULT '{}'::text[] NOT NULL,
    gif text DEFAULT ''::text NOT NULL,
    geo text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    decided_by integer,
    decided_at timestamp with time zone,
    post_id integer,
    mx_coauthor_id integer,
    CONSTRAINT pablik_suggestions_check CHECK (((char_length(text) <= 5000) AND (char_length(geo) <= 100))),
    CONSTRAINT pablik_suggestions_check1 CHECK (((btrim(text) <> ''::text) OR (cardinality(pics) > 0) OR (gif <> ''::text))),
    CONSTRAINT pablik_suggestions_check2 CHECK ((((status = 'pending'::text) AND (decided_at IS NULL) AND (post_id IS NULL)) OR ((status = ANY (ARRAY['accepted'::text, 'rejected'::text])) AND (decided_at IS NOT NULL)))),
    CONSTRAINT pablik_suggestions_check3 CHECK (((status = 'accepted'::text) OR (post_id IS NULL))),
    CONSTRAINT pablik_suggestions_pics_check CHECK ((cardinality(pics) <= 5)),
    CONSTRAINT pablik_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);


--
-- Name: pablik_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pablik_suggestions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.pablik_suggestions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pablik_tg; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_tg (
    cid integer NOT NULL,
    url text NOT NULL,
    last_id bigint DEFAULT 0 NOT NULL,
    ca timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pablik_write_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pablik_write_blocks (
    cid integer NOT NULL,
    uid integer NOT NULL,
    blocked_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pabliks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pabliks (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    name text NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    photo text DEFAULT ''::text NOT NULL,
    banner text DEFAULT ''::text NOT NULL,
    max_members integer DEFAULT 1000 NOT NULL,
    member_count integer DEFAULT 0 NOT NULL,
    posting text DEFAULT 'owner'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    rules text DEFAULT ''::text NOT NULL,
    CONSTRAINT pabliks_banner_check CHECK (((banner = ''::text) OR (banner ~~ '/uploads/%'::text))),
    CONSTRAINT pabliks_bio_check CHECK ((char_length(bio) <= 5000)),
    CONSTRAINT pabliks_check CHECK (((member_count >= 0) AND (member_count <= max_members))),
    CONSTRAINT pabliks_max_members_check CHECK ((max_members >= 1)),
    CONSTRAINT pabliks_name_check CHECK (((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 100))),
    CONSTRAINT pabliks_photo_check CHECK (((photo = ''::text) OR (photo ~~ '/uploads/%'::text))),
    CONSTRAINT pabliks_posting_check CHECK ((posting = ANY (ARRAY['owner'::text, 'all'::text]))),
    CONSTRAINT pabliks_rules_length_check CHECK ((char_length(rules) <= 5000))
);


--
-- Name: pabliks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pabliks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pabliks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pabliks_id_seq OWNED BY public.pabliks.id;


--
-- Name: post_acts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_acts (
    pid integer,
    uid integer,
    typ character varying(10)
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    avtor_id integer,
    text text DEFAULT ''::text,
    pics text[] DEFAULT '{}'::text[],
    gif text DEFAULT ''::text,
    vidimist text DEFAULT 'publichno'::text,
    geo text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    laiki integer DEFAULT 0,
    dislaiki integer DEFAULT 0,
    reposts integer DEFAULT 0,
    shared integer DEFAULT 0,
    viewz integer DEFAULT 0,
    zredagovano boolean DEFAULT false,
    zkoli timestamp with time zone,
    skilki_commentariv integer DEFAULT 0 NOT NULL,
    tags text[],
    misto text DEFAULT ''::text NOT NULL,
    mx_coauthor_id integer
);


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: pr; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr (
    id bigint NOT NULL,
    pid bigint,
    uid bigint,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pr_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_id_seq OWNED BY public.pr.id;


--
-- Name: rp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rp (
    id bigint NOT NULL,
    pid bigint,
    uid bigint,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: rp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rp_id_seq OWNED BY public.rp.id;


--
-- Name: saity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saity (
    id bigint NOT NULL,
    avtor_id integer NOT NULL,
    nazva text NOT NULL,
    opis text DEFAULT ''::text NOT NULL,
    url text NOT NULL,
    vyd text NOT NULL,
    skrin text NOT NULL,
    revision integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    CONSTRAINT saity_check CHECK ((updated_at >= created_at)),
    CONSTRAINT saity_nazva_check CHECK ((((char_length(nazva) >= 1) AND (char_length(nazva) <= 160)) AND (nazva = btrim(nazva)))),
    CONSTRAINT saity_opis_check CHECK ((char_length(opis) <= 5000)),
    CONSTRAINT saity_revision_check CHECK ((revision > 0)),
    CONSTRAINT saity_skrin_check CHECK ((skrin ~ '^/uploads/saity/[A-Za-z0-9_-]+[.](png|jpg|jpeg|webp)$'::text)),
    CONSTRAINT saity_url_check CHECK (((char_length(url) <= 2048) AND (url ~* '^https?://[^[:space:]]+$'::text))),
    CONSTRAINT saity_vyd_check CHECK ((vyd = ANY (ARRAY['personal'::text, 'blog'::text, 'forum'::text, 'community'::text, 'news'::text, 'media'::text, 'education'::text, 'science'::text, 'reference'::text, 'library'::text, 'games'::text, 'technology'::text, 'software'::text, 'music'::text, 'video'::text, 'art'::text, 'portfolio'::text, 'shop'::text, 'services'::text, 'other'::text])))
);


--
-- Name: saity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saity_id_seq OWNED BY public.saity.id;


--
-- Name: ses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ses (
    id bigint NOT NULL,
    uid bigint,
    token text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ses_id_seq OWNED BY public.ses.id;


--
-- Name: useri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.useri (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    poshta character varying(100),
    passw text NOT NULL,
    photo text DEFAULT ''::text,
    register_at timestamp with time zone DEFAULT now(),
    birth text DEFAULT ''::text,
    gender text DEFAULT ''::text,
    misto text DEFAULT ''::text,
    kraina text DEFAULT ''::text,
    hobbies text DEFAULT ''::text,
    musica text DEFAULT ''::text,
    games text DEFAULT ''::text,
    other text DEFAULT ''::text,
    bannerok text DEFAULT ''::text,
    bio text DEFAULT ''::text,
    persite text DEFAULT ''::text,
    tg text DEFAULT ''::text,
    insta text DEFAULT ''::text,
    x text DEFAULT ''::text,
    youtube text DEFAULT ''::text,
    github text DEFAULT ''::text,
    gitlab text DEFAULT ''::text,
    spotify text DEFAULT ''::text,
    status text DEFAULT ''::text,
    bg text DEFAULT ''::text,
    googleid text,
    music text DEFAULT ''::text,
    posti boolean DEFAULT true NOT NULL,
    druzi boolean DEFAULT true NOT NULL,
    em text,
    vc text,
    iv boolean DEFAULT false,
    vt timestamp with time zone,
    bi text DEFAULT ''::text,
    pr text DEFAULT ''::text,
    la timestamp with time zone DEFAULT now(),
    frame text DEFAULT ''::text NOT NULL,
    profile_layout jsonb DEFAULT '{"order": ["profile", "photos", "posts"], "blocks": [], "hidden": [], "styles": {}, "version": 1}'::jsonb NOT NULL,
    ideology text DEFAULT ''::text NOT NULL,
    ideologies jsonb DEFAULT '[]'::jsonb NOT NULL,
    religion text DEFAULT ''::text NOT NULL,
    smoking text DEFAULT ''::text NOT NULL,
    alcohol text DEFAULT ''::text NOT NULL,
    relationship text DEFAULT ''::text NOT NULL,
    mbti text DEFAULT ''::text NOT NULL,
    enneagram text DEFAULT ''::text NOT NULL,
    enneawing text DEFAULT ''::text NOT NULL,
    enneasubtype text DEFAULT ''::text NOT NULL,
    instinct text DEFAULT ''::text NOT NULL,
    tritype text DEFAULT ''::text NOT NULL,
    phobias jsonb DEFAULT '[]'::jsonb NOT NULL,
    activity text DEFAULT ''::text NOT NULL,
    films text DEFAULT ''::text NOT NULL,
    series text DEFAULT ''::text NOT NULL,
    books text DEFAULT ''::text NOT NULL,
    quotes text DEFAULT ''::text NOT NULL,
    school text DEFAULT ''::text NOT NULL,
    university text DEFAULT ''::text NOT NULL,
    work text DEFAULT ''::text NOT NULL,
    kicq text DEFAULT ''::text NOT NULL,
    openvk text DEFAULT ''::text NOT NULL,
    discord text DEFAULT ''::text NOT NULL,
    steam text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    mae_2fa boolean DEFAULT false NOT NULL,
    auth_version bigint DEFAULT 0 NOT NULL
);


--
-- Name: useri_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.useri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: useri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.useri_id_seq OWNED BY public.useri.id;


--
-- Name: video_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_comments (
    id bigint NOT NULL,
    vid bigint NOT NULL,
    avtor_id integer NOT NULL,
    client_key uuid NOT NULL,
    parent_id bigint,
    rev bigint DEFAULT 0 NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_comments_check CHECK (((parent_id IS NULL) OR (parent_id < id))),
    CONSTRAINT video_comments_rev_check CHECK ((rev >= 0)),
    CONSTRAINT video_comments_text_check CHECK (((char_length(btrim(text)) >= 1) AND (char_length(btrim(text)) <= 5000)))
);


--
-- Name: video_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.video_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: video_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.video_comments_id_seq OWNED BY public.video_comments.id;


--
-- Name: video_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_reactions (
    vid bigint NOT NULL,
    uid integer NOT NULL,
    reaction smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_reactions_reaction_check CHECK ((reaction = ANY (ARRAY['-1'::integer, 1])))
);


--
-- Name: video_reposts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_reposts (
    vid bigint NOT NULL,
    uid integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: video_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_shares (
    vid bigint NOT NULL,
    viewer_key character varying(80) NOT NULL,
    uid integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_shares_check CHECK (((uid IS NULL) OR ((viewer_key)::text = ('u:'::text || (uid)::text)))),
    CONSTRAINT video_shares_viewer_key_check CHECK (((viewer_key)::text ~ '^(u:[1-9][0-9]*|g:[0-9a-f]{64})$'::text))
);


--
-- Name: video_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_views (
    vid bigint NOT NULL,
    viewer_key character varying(80) NOT NULL,
    uid integer,
    watched_ms integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_views_check CHECK (((uid IS NULL) OR ((viewer_key)::text = ('u:'::text || (uid)::text)))),
    CONSTRAINT video_views_viewer_key_check CHECK (((viewer_key)::text ~ '^(u:[1-9][0-9]*|g:[0-9a-f]{64})$'::text)),
    CONSTRAINT video_views_watched_ms_check CHECK (((watched_ms >= 1000) AND (watched_ms <= 86400000)))
);


--
-- Name: video_watch_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_watch_sessions (
    token_hash character(64) NOT NULL,
    vid bigint NOT NULL,
    viewer_key character varying(80) NOT NULL,
    uid integer,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:30:00'::interval) NOT NULL,
    finished boolean DEFAULT false NOT NULL,
    CONSTRAINT video_watch_sessions_check CHECK ((expires_at > started_at)),
    CONSTRAINT video_watch_sessions_check1 CHECK (((uid IS NULL) OR ((viewer_key)::text = ('u:'::text || (uid)::text)))),
    CONSTRAINT video_watch_sessions_token_hash_check CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT video_watch_sessions_viewer_key_check CHECK (((viewer_key)::text ~ '^(u:[1-9][0-9]*|g:[0-9a-f]{64})$'::text))
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id bigint NOT NULL,
    avtor_id integer NOT NULL,
    client_key uuid NOT NULL,
    nazva character varying(160) NOT NULL,
    opis text DEFAULT ''::text NOT NULL,
    source text NOT NULL,
    original_name text DEFAULT ''::text NOT NULL,
    source_size bigint NOT NULL,
    source_mime text DEFAULT ''::text NOT NULL,
    failik text DEFAULT ''::text NOT NULL,
    video_size bigint DEFAULT 0 NOT NULL,
    preview text NOT NULL,
    preview_size bigint NOT NULL,
    preview_width integer NOT NULL,
    preview_height integer NOT NULL,
    status character varying(12) DEFAULT 'processing'::character varying NOT NULL,
    error text DEFAULT ''::text NOT NULL,
    duration double precision DEFAULT 0 NOT NULL,
    width integer DEFAULT 0 NOT NULL,
    height integer DEFAULT 0 NOT NULL,
    laiki bigint DEFAULT 0 NOT NULL,
    dislaiki bigint DEFAULT 0 NOT NULL,
    reposts bigint DEFAULT 0 NOT NULL,
    shared bigint DEFAULT 0 NOT NULL,
    viewz bigint DEFAULT 0 NOT NULL,
    skilki_commentariv bigint DEFAULT 0 NOT NULL,
    rev bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT videos_check CHECK ((((status)::text <> 'ready'::text) OR ((failik <> ''::text) AND (duration > (0)::double precision) AND (width > 0) AND (height > 0)))),
    CONSTRAINT videos_dislaiki_check CHECK ((dislaiki >= 0)),
    CONSTRAINT videos_duration_check CHECK (((duration >= (0)::double precision) AND (duration < 'Infinity'::double precision))),
    CONSTRAINT videos_height_check CHECK ((height >= 0)),
    CONSTRAINT videos_laiki_check CHECK ((laiki >= 0)),
    CONSTRAINT videos_nazva_check CHECK (((char_length(btrim((nazva)::text)) >= 1) AND (char_length(btrim((nazva)::text)) <= 160))),
    CONSTRAINT videos_opis_check CHECK ((char_length(opis) <= 5000)),
    CONSTRAINT videos_preview_check CHECK ((preview <> ''::text)),
    CONSTRAINT videos_preview_height_check CHECK (((preview_height >= 1) AND (preview_height <= 1080))),
    CONSTRAINT videos_preview_size_check CHECK (((preview_size >= 1) AND (preview_size <= 20971520))),
    CONSTRAINT videos_preview_width_check CHECK (((preview_width >= 1) AND (preview_width <= 1920))),
    CONSTRAINT videos_reposts_check CHECK ((reposts >= 0)),
    CONSTRAINT videos_rev_check CHECK ((rev >= 0)),
    CONSTRAINT videos_shared_check CHECK ((shared >= 0)),
    CONSTRAINT videos_skilki_commentariv_check CHECK ((skilki_commentariv >= 0)),
    CONSTRAINT videos_source_check CHECK ((source <> ''::text)),
    CONSTRAINT videos_source_size_check CHECK (((source_size >= 1) AND (source_size <= 268435456))),
    CONSTRAINT videos_status_check CHECK (((status)::text = ANY ((ARRAY['processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT videos_video_size_check CHECK ((video_size >= 0)),
    CONSTRAINT videos_viewz_check CHECK ((viewz >= 0)),
    CONSTRAINT videos_width_check CHECK ((width >= 0))
);


--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.videos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: askmr_pytannia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_pytannia ALTER COLUMN id SET DEFAULT nextval('public.askmr_pytannia_id_seq'::regclass);


--
-- Name: askmr_vidpovidi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_vidpovidi ALTER COLUMN id SET DEFAULT nextval('public.askmr_vidpovidi_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: druzi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzi ALTER COLUMN id SET DEFAULT nextval('public.druzi_id_seq'::regclass);


--
-- Name: flash id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash ALTER COLUMN id SET DEFAULT nextval('public.flash_id_seq'::regclass);


--
-- Name: flash_acts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_acts ALTER COLUMN id SET DEFAULT nextval('public.flash_acts_id_seq'::regclass);


--
-- Name: hostingsites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostingsites ALTER COLUMN id SET DEFAULT nextval('public.hostingsites_id_seq'::regclass);


--
-- Name: mriya_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports ALTER COLUMN id SET DEFAULT nextval('public.mriya_reports_id_seq'::regclass);


--
-- Name: mriya_reports_gc id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports_gc ALTER COLUMN id SET DEFAULT nextval('public.mriya_reports_gc_id_seq'::regclass);


--
-- Name: music id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music ALTER COLUMN id SET DEFAULT nextval('public.music_id_seq'::regclass);


--
-- Name: noti id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noti ALTER COLUMN id SET DEFAULT nextval('public.noti_id_seq'::regclass);


--
-- Name: pablik_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_posts ALTER COLUMN id SET DEFAULT nextval('public.pablik_posts_id_seq'::regclass);


--
-- Name: pabliks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pabliks ALTER COLUMN id SET DEFAULT nextval('public.pabliks_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: pr id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr ALTER COLUMN id SET DEFAULT nextval('public.pr_id_seq'::regclass);


--
-- Name: rp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rp ALTER COLUMN id SET DEFAULT nextval('public.rp_id_seq'::regclass);


--
-- Name: saity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saity ALTER COLUMN id SET DEFAULT nextval('public.saity_id_seq'::regclass);


--
-- Name: ses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ses ALTER COLUMN id SET DEFAULT nextval('public.ses_id_seq'::regclass);


--
-- Name: useri id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.useri ALTER COLUMN id SET DEFAULT nextval('public.useri_id_seq'::regclass);


--
-- Name: video_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments ALTER COLUMN id SET DEFAULT nextval('public.video_comments_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Name: askmr_krashchi askmr_krashchi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_krashchi
    ADD CONSTRAINT askmr_krashchi_pkey PRIMARY KEY (pytannia_id);


--
-- Name: askmr_krashchi askmr_krashchi_vidpovid_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_krashchi
    ADD CONSTRAINT askmr_krashchi_vidpovid_id_key UNIQUE (vidpovid_id);


--
-- Name: askmr_pytannia askmr_pytannia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_pytannia
    ADD CONSTRAINT askmr_pytannia_pkey PRIMARY KEY (id);


--
-- Name: askmr_vidpovidi askmr_vidpovidi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_vidpovidi
    ADD CONSTRAINT askmr_vidpovidi_pkey PRIMARY KEY (id);


--
-- Name: askmr_vidpovidi askmr_vidpovidi_pytannia_id_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_vidpovidi
    ADD CONSTRAINT askmr_vidpovidi_pytannia_id_id_key UNIQUE (pytannia_id, id);


--
-- Name: auth_mail_codes auth_mail_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mail_codes
    ADD CONSTRAINT auth_mail_codes_pkey PRIMARY KEY (token_hash);


--
-- Name: auth_mail_codes auth_mail_codes_uid_purpose_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mail_codes
    ADD CONSTRAINT auth_mail_codes_uid_purpose_key UNIQUE (uid, purpose);


--
-- Name: auth_mail_limits auth_mail_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mail_limits
    ADD CONSTRAINT auth_mail_limits_pkey PRIMARY KEY (bucket);


--
-- Name: comments comments_id_pid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_id_pid_key UNIQUE (id, pid);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: druzi druzi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzi
    ADD CONSTRAINT druzi_pkey PRIMARY KEY (id);


--
-- Name: flash_acts flash_acts_fid_uid_typ_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_acts
    ADD CONSTRAINT flash_acts_fid_uid_typ_key UNIQUE (fid, uid, typ);


--
-- Name: flash_acts flash_acts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_acts
    ADD CONSTRAINT flash_acts_pkey PRIMARY KEY (id);


--
-- Name: flash_lk flash_lk_fid_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_lk
    ADD CONSTRAINT flash_lk_fid_uid_key UNIQUE (fid, uid);


--
-- Name: flash flash_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash
    ADD CONSTRAINT flash_pkey PRIMARY KEY (id);


--
-- Name: galki galki_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galki
    ADD CONSTRAINT galki_pkey PRIMARY KEY (uid);


--
-- Name: hostingsites hostingsites_adres_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostingsites
    ADD CONSTRAINT hostingsites_adres_key UNIQUE (adres);


--
-- Name: hostingsites hostingsites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostingsites
    ADD CONSTRAINT hostingsites_pkey PRIMARY KEY (id);


--
-- Name: invgalki invgalki_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invgalki
    ADD CONSTRAINT invgalki_pkey PRIMARY KEY (uid, pic, label);


--
-- Name: mriya_reports mriya_reports_author_id_request_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports
    ADD CONSTRAINT mriya_reports_author_id_request_key_key UNIQUE (author_id, request_key);


--
-- Name: mriya_reports_gc mriya_reports_gc_kind_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports_gc
    ADD CONSTRAINT mriya_reports_gc_kind_name_key UNIQUE (kind, name);


--
-- Name: mriya_reports_gc mriya_reports_gc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports_gc
    ADD CONSTRAINT mriya_reports_gc_pkey PRIMARY KEY (id);


--
-- Name: mriya_reports mriya_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports
    ADD CONSTRAINT mriya_reports_pkey PRIMARY KEY (id);


--
-- Name: music music_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_pkey PRIMARY KEY (id);


--
-- Name: native_files native_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.native_files
    ADD CONSTRAINT native_files_pkey PRIMARY KEY (kind, name);


--
-- Name: native_settings native_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.native_settings
    ADD CONSTRAINT native_settings_pkey PRIMARY KEY (uid);


--
-- Name: noti noti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noti
    ADD CONSTRAINT noti_pkey PRIMARY KEY (id);


--
-- Name: pablik_acts pablik_acts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_acts
    ADD CONSTRAINT pablik_acts_pkey PRIMARY KEY (pid, uid, typ);


--
-- Name: pablik_extras pablik_extras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_extras
    ADD CONSTRAINT pablik_extras_pkey PRIMARY KEY (cid);


--
-- Name: pablik_members pablik_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_members
    ADD CONSTRAINT pablik_members_pkey PRIMARY KEY (cid, uid);


--
-- Name: pablik_post_identity pablik_post_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_post_identity
    ADD CONSTRAINT pablik_post_identity_pkey PRIMARY KEY (pid);


--
-- Name: pablik_posts pablik_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_posts
    ADD CONSTRAINT pablik_posts_pkey PRIMARY KEY (id);


--
-- Name: pablik_suggestions pablik_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_pkey PRIMARY KEY (id);


--
-- Name: pablik_tg pablik_tg_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_tg
    ADD CONSTRAINT pablik_tg_pkey PRIMARY KEY (cid);


--
-- Name: pablik_write_blocks pablik_write_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_write_blocks
    ADD CONSTRAINT pablik_write_blocks_pkey PRIMARY KEY (cid, uid);


--
-- Name: pabliks pabliks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pabliks
    ADD CONSTRAINT pabliks_pkey PRIMARY KEY (id);


--
-- Name: post_acts post_acts_pid_uid_typ_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_acts
    ADD CONSTRAINT post_acts_pid_uid_typ_key UNIQUE (pid, uid, typ);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: pr pr_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr
    ADD CONSTRAINT pr_pkey PRIMARY KEY (id);


--
-- Name: rp rp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rp
    ADD CONSTRAINT rp_pkey PRIMARY KEY (id);


--
-- Name: saity saity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saity
    ADD CONSTRAINT saity_pkey PRIMARY KEY (id);


--
-- Name: ses ses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ses
    ADD CONSTRAINT ses_pkey PRIMARY KEY (id);


--
-- Name: useri useri_em_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.useri
    ADD CONSTRAINT useri_em_key UNIQUE (em);


--
-- Name: useri useri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.useri
    ADD CONSTRAINT useri_pkey PRIMARY KEY (id);


--
-- Name: useri useri_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.useri
    ADD CONSTRAINT useri_username_key UNIQUE (username);


--
-- Name: video_comments video_comments_avtor_id_client_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_avtor_id_client_key_key UNIQUE (avtor_id, client_key);


--
-- Name: video_comments video_comments_id_vid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_id_vid_key UNIQUE (id, vid);


--
-- Name: video_comments video_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_pkey PRIMARY KEY (id);


--
-- Name: video_reactions video_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reactions
    ADD CONSTRAINT video_reactions_pkey PRIMARY KEY (vid, uid);


--
-- Name: video_reposts video_reposts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reposts
    ADD CONSTRAINT video_reposts_pkey PRIMARY KEY (vid, uid);


--
-- Name: video_shares video_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_shares
    ADD CONSTRAINT video_shares_pkey PRIMARY KEY (vid, viewer_key);


--
-- Name: video_views video_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_pkey PRIMARY KEY (vid, viewer_key);


--
-- Name: video_watch_sessions video_watch_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch_sessions
    ADD CONSTRAINT video_watch_sessions_pkey PRIMARY KEY (token_hash);


--
-- Name: videos videos_avtor_id_client_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_avtor_id_client_key_key UNIQUE (avtor_id, client_key);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: askmr_pytannia_avtor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX askmr_pytannia_avtor_idx ON public.askmr_pytannia USING btree (avtor_id);


--
-- Name: askmr_pytannia_chas_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX askmr_pytannia_chas_idx ON public.askmr_pytannia USING btree (stvoreno DESC, id DESC);


--
-- Name: askmr_pytannia_katehoriia_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX askmr_pytannia_katehoriia_idx ON public.askmr_pytannia USING btree (katehoriia, stvoreno DESC, id DESC);


--
-- Name: askmr_vidpovidi_avtor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX askmr_vidpovidi_avtor_idx ON public.askmr_vidpovidi USING btree (avtor_id);


--
-- Name: askmr_vidpovidi_pytannia_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX askmr_vidpovidi_pytannia_idx ON public.askmr_vidpovidi USING btree (pytannia_id, stvoreno, id);


--
-- Name: auth_mail_codes_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_mail_codes_expiry_idx ON public.auth_mail_codes USING btree (expires_at);


--
-- Name: auth_mail_limits_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_mail_limits_expiry_idx ON public.auth_mail_limits USING btree (opened_at);


--
-- Name: comments_pid_ca_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_pid_ca_idx ON public.comments USING btree (pid, ca, id);


--
-- Name: comments_rid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_rid_idx ON public.comments USING btree (rid);


--
-- Name: comments_uid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_uid_idx ON public.comments USING btree (uid);


--
-- Name: druzi_accepted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX druzi_accepted ON public.druzi USING btree (first_id, accepted_at DESC, id DESC) WHERE (status = 'priynato'::text);


--
-- Name: druzi_incoming; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX druzi_incoming ON public.druzi USING btree (second_id, created_at DESC, id DESC) WHERE (status = 'waiting'::text);


--
-- Name: druzi_pair_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX druzi_pair_unique ON public.druzi USING btree (LEAST(first_id, second_id), GREATEST(first_id, second_id));


--
-- Name: hostingsites_uid_zmineno_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hostingsites_uid_zmineno_idx ON public.hostingsites USING btree (uid, zmineno DESC, id DESC);


--
-- Name: mriya_reports_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mriya_reports_feed_idx ON public.mriya_reports USING btree (id DESC);


--
-- Name: mriya_reports_pending_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX mriya_reports_pending_unique ON public.mriya_reports USING btree (author_id, kind, target_id) WHERE (status = 'pending'::text);


--
-- Name: mriya_reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mriya_reports_status_idx ON public.mriya_reports USING btree (status, id DESC);


--
-- Name: mriya_reports_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mriya_reports_target_idx ON public.mriya_reports USING btree (kind, target_id);


--
-- Name: music_albom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_albom_idx ON public.music USING btree (lower((albom)::text));


--
-- Name: music_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_author_idx ON public.music USING btree (lower((author)::text));


--
-- Name: music_genre_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_genre_idx ON public.music USING btree (genre);


--
-- Name: music_nazva_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_nazva_idx ON public.music USING btree (lower((nazva)::text));


--
-- Name: music_uploader_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_uploader_idx ON public.music USING btree (uploader);


--
-- Name: music_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_year_idx ON public.music USING btree (godvipuska);


--
-- Name: pablik_acts_reaction_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pablik_acts_reaction_idx ON public.pablik_acts USING btree (pid, uid) WHERE (typ = ANY (ARRAY['like'::text, 'dislike'::text]));


--
-- Name: pablik_acts_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_acts_user_idx ON public.pablik_acts USING btree (uid, typ, pid);


--
-- Name: pablik_members_joined_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_members_joined_idx ON public.pablik_members USING btree (cid, joined_at, uid);


--
-- Name: pablik_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_members_user_idx ON public.pablik_members USING btree (uid, cid);


--
-- Name: pablik_posts_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_posts_author_idx ON public.pablik_posts USING btree (avtor_id);


--
-- Name: pablik_posts_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_posts_feed_idx ON public.pablik_posts USING btree (cid, created_at DESC, id DESC);


--
-- Name: pablik_posts_mx_coauthor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_posts_mx_coauthor_idx ON public.pablik_posts USING btree (mx_coauthor_id) WHERE (mx_coauthor_id IS NOT NULL);


--
-- Name: pablik_suggestions_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_suggestions_author_idx ON public.pablik_suggestions USING btree (avtor_id, cid);


--
-- Name: pablik_suggestions_mx_coauthor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_suggestions_mx_coauthor_idx ON public.pablik_suggestions USING btree (mx_coauthor_id) WHERE (mx_coauthor_id IS NOT NULL);


--
-- Name: pablik_suggestions_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_suggestions_pending_idx ON public.pablik_suggestions USING btree (cid, created_at, id) WHERE (status = 'pending'::text);


--
-- Name: pablik_suggestions_post_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pablik_suggestions_post_idx ON public.pablik_suggestions USING btree (post_id) WHERE (post_id IS NOT NULL);


--
-- Name: pablik_write_blocks_uid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pablik_write_blocks_uid_idx ON public.pablik_write_blocks USING btree (uid);


--
-- Name: pabliks_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pabliks_created_idx ON public.pabliks USING btree (created_at DESC, id DESC);


--
-- Name: pabliks_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pabliks_owner_idx ON public.pabliks USING btree (owner_id);


--
-- Name: posts_mx_coauthor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX posts_mx_coauthor_idx ON public.posts USING btree (mx_coauthor_id) WHERE (mx_coauthor_id IS NOT NULL);


--
-- Name: saity_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX saity_created_idx ON public.saity USING btree (created_at DESC, id DESC);


--
-- Name: saity_owner_url_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX saity_owner_url_unique ON public.saity USING btree (avtor_id, url);


--
-- Name: saity_title_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX saity_title_idx ON public.saity USING btree (lower(nazva), id);


--
-- Name: saity_vyd_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX saity_vyd_created_idx ON public.saity USING btree (vyd, created_at DESC, id DESC);


--
-- Name: strichka_acts_type_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX strichka_acts_type_v1 ON public.post_acts USING btree (pid, typ, uid);


--
-- Name: strichka_posts_author_date_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX strichka_posts_author_date_v1 ON public.posts USING btree (avtor_id, created_at DESC, id DESC);


--
-- Name: strichka_posts_date_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX strichka_posts_date_v1 ON public.posts USING btree (created_at DESC, id DESC);


--
-- Name: useri_po; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX useri_po ON public.useri USING btree (lower((poshta)::text));


--
-- Name: useri_un; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX useri_un ON public.useri USING btree (lower((username)::text));


--
-- Name: video_comments_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_comments_parent_idx ON public.video_comments USING btree (parent_id, vid);


--
-- Name: video_comments_video_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_comments_video_idx ON public.video_comments USING btree (vid, id);


--
-- Name: video_reposts_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_reposts_user_idx ON public.video_reposts USING btree (uid, created_at DESC, vid DESC);


--
-- Name: video_watch_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_watch_expiry_idx ON public.video_watch_sessions USING btree (expires_at);


--
-- Name: video_watch_rate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_watch_rate_idx ON public.video_watch_sessions USING btree (viewer_key, started_at DESC);


--
-- Name: video_watch_viewer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_watch_viewer_idx ON public.video_watch_sessions USING btree (vid, viewer_key, started_at DESC);


--
-- Name: videos_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_author_idx ON public.videos USING btree (avtor_id, created_at DESC, id DESC);


--
-- Name: videos_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_created_idx ON public.videos USING btree (created_at DESC, id DESC);


--
-- Name: videos_dislikes_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_dislikes_idx ON public.videos USING btree (dislaiki DESC, id DESC);


--
-- Name: videos_likes_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_likes_idx ON public.videos USING btree (laiki DESC, id DESC);


--
-- Name: videos_reposts_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_reposts_idx ON public.videos USING btree (reposts DESC, id DESC);


--
-- Name: videos_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_status_idx ON public.videos USING btree (status, created_at, id);


--
-- Name: askmr_vidpovidi askmr_obmezh_vidpovid_trg; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER askmr_obmezh_vidpovid_trg BEFORE INSERT ON public.askmr_vidpovidi FOR EACH ROW EXECUTE FUNCTION public.askmr_obmezh_vidpovid();


--
-- Name: comments comments_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_count AFTER INSERT OR DELETE OR UPDATE OF del ON public.comments FOR EACH ROW EXECUTE FUNCTION public.cmc();


--
-- Name: pablik_extras pablik_extras_pin_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pablik_extras_pin_guard BEFORE INSERT OR UPDATE ON public.pablik_extras FOR EACH ROW EXECUTE FUNCTION public.pbextras_pin_guard();


--
-- Name: pablik_members pablik_members_extra_gate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pablik_members_extra_gate BEFORE INSERT ON public.pablik_members FOR EACH ROW EXECUTE FUNCTION public.pbextras_join_guard();


--
-- Name: pablik_members pablik_members_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pablik_members_limit BEFORE INSERT OR DELETE OR UPDATE ON public.pablik_members FOR EACH ROW EXECUTE FUNCTION public.pbm();


--
-- Name: pablik_posts pablik_posts_check; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pablik_posts_check BEFORE INSERT OR UPDATE ON public.pablik_posts FOR EACH ROW EXECUTE FUNCTION public.pbp();


--
-- Name: pabliks pabliks_owner_fixed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pabliks_owner_fixed BEFORE UPDATE OF owner_id ON public.pabliks FOR EACH ROW EXECUTE FUNCTION public.pbo();


--
-- Name: pabliks pabliks_owner_join; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pabliks_owner_join AFTER INSERT ON public.pabliks FOR EACH ROW EXECUTE FUNCTION public.pbo();


--
-- Name: video_comments video_comments_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_comments_stats AFTER INSERT OR DELETE OR UPDATE ON public.video_comments FOR EACH ROW EXECUTE FUNCTION public.video_stats();


--
-- Name: video_comments video_comments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_comments_touch BEFORE UPDATE ON public.video_comments FOR EACH ROW EXECUTE FUNCTION public.video_touch();


--
-- Name: video_reactions video_reactions_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_reactions_stats AFTER INSERT OR DELETE OR UPDATE ON public.video_reactions FOR EACH ROW EXECUTE FUNCTION public.video_stats();


--
-- Name: video_reposts video_reposts_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_reposts_stats AFTER INSERT OR DELETE ON public.video_reposts FOR EACH ROW EXECUTE FUNCTION public.video_stats();


--
-- Name: video_shares video_shares_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_shares_stats AFTER INSERT OR DELETE ON public.video_shares FOR EACH ROW EXECUTE FUNCTION public.video_stats();


--
-- Name: video_views video_views_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER video_views_stats AFTER INSERT OR DELETE ON public.video_views FOR EACH ROW EXECUTE FUNCTION public.video_stats();


--
-- Name: videos videos_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER videos_touch BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.video_touch();


--
-- Name: askmr_krashchi askmr_krashchi_pytannia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_krashchi
    ADD CONSTRAINT askmr_krashchi_pytannia_id_fkey FOREIGN KEY (pytannia_id) REFERENCES public.askmr_pytannia(id) ON DELETE CASCADE;


--
-- Name: askmr_krashchi askmr_krashchi_pytannia_id_vidpovid_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_krashchi
    ADD CONSTRAINT askmr_krashchi_pytannia_id_vidpovid_id_fkey FOREIGN KEY (pytannia_id, vidpovid_id) REFERENCES public.askmr_vidpovidi(pytannia_id, id) ON DELETE CASCADE;


--
-- Name: askmr_pytannia askmr_pytannia_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_pytannia
    ADD CONSTRAINT askmr_pytannia_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: askmr_vidpovidi askmr_vidpovidi_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_vidpovidi
    ADD CONSTRAINT askmr_vidpovidi_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: askmr_vidpovidi askmr_vidpovidi_pytannia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.askmr_vidpovidi
    ADD CONSTRAINT askmr_vidpovidi_pytannia_id_fkey FOREIGN KEY (pytannia_id) REFERENCES public.askmr_pytannia(id) ON DELETE CASCADE;


--
-- Name: auth_mail_codes auth_mail_codes_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mail_codes
    ADD CONSTRAINT auth_mail_codes_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: comments comments_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pid_fkey FOREIGN KEY (pid) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_rid_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_rid_pid_fkey FOREIGN KEY (rid, pid) REFERENCES public.comments(id, pid) ON DELETE CASCADE;


--
-- Name: comments comments_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: druzi druzi_first_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzi
    ADD CONSTRAINT druzi_first_id_fkey FOREIGN KEY (first_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: druzi druzi_second_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.druzi
    ADD CONSTRAINT druzi_second_id_fkey FOREIGN KEY (second_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: flash_lk flash_lk_fid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_lk
    ADD CONSTRAINT flash_lk_fid_fkey FOREIGN KEY (fid) REFERENCES public.flash(id) ON DELETE CASCADE;


--
-- Name: flash_lk flash_lk_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_lk
    ADD CONSTRAINT flash_lk_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: flash flash_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash
    ADD CONSTRAINT flash_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id);


--
-- Name: galki galki_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galki
    ADD CONSTRAINT galki_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: hostingsites hostingsites_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostingsites
    ADD CONSTRAINT hostingsites_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: invgalki invgalki_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invgalki
    ADD CONSTRAINT invgalki_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: mriya_reports mriya_reports_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports
    ADD CONSTRAINT mriya_reports_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: mriya_reports mriya_reports_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mriya_reports
    ADD CONSTRAINT mriya_reports_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: music music_uploader_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_uploader_fkey FOREIGN KEY (uploader) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: native_settings native_settings_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.native_settings
    ADD CONSTRAINT native_settings_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: noti noti_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noti
    ADD CONSTRAINT noti_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: noti noti_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noti
    ADD CONSTRAINT noti_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pablik_acts pablik_acts_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_acts
    ADD CONSTRAINT pablik_acts_pid_fkey FOREIGN KEY (pid) REFERENCES public.pablik_posts(id) ON DELETE CASCADE;


--
-- Name: pablik_acts pablik_acts_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_acts
    ADD CONSTRAINT pablik_acts_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pablik_extras pablik_extras_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_extras
    ADD CONSTRAINT pablik_extras_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_extras pablik_extras_pinned_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_extras
    ADD CONSTRAINT pablik_extras_pinned_post_id_fkey FOREIGN KEY (pinned_post_id) REFERENCES public.pablik_posts(id) ON DELETE SET NULL;


--
-- Name: pablik_members pablik_members_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_members
    ADD CONSTRAINT pablik_members_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_members pablik_members_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_members
    ADD CONSTRAINT pablik_members_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pablik_post_identity pablik_post_identity_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_post_identity
    ADD CONSTRAINT pablik_post_identity_pid_fkey FOREIGN KEY (pid) REFERENCES public.pablik_posts(id) ON DELETE CASCADE;


--
-- Name: pablik_posts pablik_posts_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_posts
    ADD CONSTRAINT pablik_posts_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pablik_posts pablik_posts_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_posts
    ADD CONSTRAINT pablik_posts_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_posts pablik_posts_mx_coauthor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_posts
    ADD CONSTRAINT pablik_posts_mx_coauthor_id_fkey FOREIGN KEY (mx_coauthor_id) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: pablik_suggestions pablik_suggestions_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pablik_suggestions pablik_suggestions_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_suggestions pablik_suggestions_decided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: pablik_suggestions pablik_suggestions_mx_coauthor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_mx_coauthor_id_fkey FOREIGN KEY (mx_coauthor_id) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: pablik_suggestions pablik_suggestions_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_suggestions
    ADD CONSTRAINT pablik_suggestions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.pablik_posts(id) ON DELETE SET NULL;


--
-- Name: pablik_tg pablik_tg_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_tg
    ADD CONSTRAINT pablik_tg_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_write_blocks pablik_write_blocks_blocked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_write_blocks
    ADD CONSTRAINT pablik_write_blocks_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: pablik_write_blocks pablik_write_blocks_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_write_blocks
    ADD CONSTRAINT pablik_write_blocks_cid_fkey FOREIGN KEY (cid) REFERENCES public.pabliks(id) ON DELETE CASCADE;


--
-- Name: pablik_write_blocks pablik_write_blocks_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pablik_write_blocks
    ADD CONSTRAINT pablik_write_blocks_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: pabliks pabliks_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pabliks
    ADD CONSTRAINT pabliks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: post_acts post_acts_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_acts
    ADD CONSTRAINT post_acts_pid_fkey FOREIGN KEY (pid) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_acts post_acts_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_acts
    ADD CONSTRAINT post_acts_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: posts posts_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id);


--
-- Name: posts posts_mx_coauthor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_mx_coauthor_id_fkey FOREIGN KEY (mx_coauthor_id) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: pr pr_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr
    ADD CONSTRAINT pr_pid_fkey FOREIGN KEY (pid) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: pr pr_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr
    ADD CONSTRAINT pr_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: rp rp_pid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rp
    ADD CONSTRAINT rp_pid_fkey FOREIGN KEY (pid) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: rp rp_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rp
    ADD CONSTRAINT rp_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: saity saity_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saity
    ADD CONSTRAINT saity_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: ses ses_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ses
    ADD CONSTRAINT ses_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: video_comments video_comments_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: video_comments video_comments_parent_id_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_parent_id_vid_fkey FOREIGN KEY (parent_id, vid) REFERENCES public.video_comments(id, vid) ON DELETE CASCADE;


--
-- Name: video_comments video_comments_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_comments
    ADD CONSTRAINT video_comments_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_reactions video_reactions_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reactions
    ADD CONSTRAINT video_reactions_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: video_reactions video_reactions_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reactions
    ADD CONSTRAINT video_reactions_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_reposts video_reposts_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reposts
    ADD CONSTRAINT video_reposts_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- Name: video_reposts video_reposts_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_reposts
    ADD CONSTRAINT video_reposts_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_shares video_shares_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_shares
    ADD CONSTRAINT video_shares_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: video_shares video_shares_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_shares
    ADD CONSTRAINT video_shares_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_views video_views_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: video_views video_views_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_watch_sessions video_watch_sessions_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch_sessions
    ADD CONSTRAINT video_watch_sessions_uid_fkey FOREIGN KEY (uid) REFERENCES public.useri(id) ON DELETE SET NULL;


--
-- Name: video_watch_sessions video_watch_sessions_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch_sessions
    ADD CONSTRAINT video_watch_sessions_vid_fkey FOREIGN KEY (vid) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: videos videos_avtor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_avtor_id_fkey FOREIGN KEY (avtor_id) REFERENCES public.useri(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


