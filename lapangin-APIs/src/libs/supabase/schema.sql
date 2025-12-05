-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  venue_id bigint,
  target_table text,
  target_id uuid,
  action text NOT NULL,
  diff jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id),
  CONSTRAINT audit_logs_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.availability_exceptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id bigint NOT NULL,
  date date NOT NULL,
  is_closed boolean DEFAULT true,
  open_time time without time zone,
  close_time time without time zone,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT availability_exceptions_pkey PRIMARY KEY (id),
  CONSTRAINT availability_exceptions_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id)
);
CREATE TABLE public.availability_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id bigint NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time without time zone NOT NULL,
  close_time time without time zone NOT NULL,
  buffer_before_minutes integer DEFAULT 0,
  buffer_after_minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT availability_rules_pkey PRIMARY KEY (id),
  CONSTRAINT availability_rules_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id)
);
CREATE TABLE public.booking_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  slot_instance_id uuid NOT NULL,
  slot_number integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_slots_pkey PRIMARY KEY (id),
  CONSTRAINT booking_slots_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT booking_slots_slot_instance_id_fkey FOREIGN KEY (slot_instance_id) REFERENCES public.slot_instances(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id bigint NOT NULL,
  user_id uuid,
  guest_name text,
  guest_phone text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::booking_status,
  price_total numeric NOT NULL DEFAULT 0,
  idempotency_key text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.courts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  venue_id bigint NOT NULL,
  name text NOT NULL,
  type text,
  weekday_slot_price numeric,
  slot_duration_minutes numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  weekend_slot_price numeric,
  is_active boolean DEFAULT true,
  capacity bigint,
  CONSTRAINT courts_pkey PRIMARY KEY (id),
  CONSTRAINT courts_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.general_price_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id bigint NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  weekday_price numeric,
  weekend_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT general_price_rules_pkey PRIMARY KEY (id),
  CONSTRAINT general_price_rules_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target text NOT NULL,
  channel text NOT NULL,
  template text,
  payload jsonb,
  status text NOT NULL DEFAULT 'pending'::text,
  attempts integer DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  gateway text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'IDR'::text,
  status USER-DEFINED NOT NULL DEFAULT 'initiated'::payment_status,
  external_txn_id text,
  raw_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  payment_recipe_url text,
  payment_recipe_metadata json,
  venue_payment_id bigint,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT payments_venue_payment_id_fkey FOREIGN KEY (venue_payment_id) REFERENCES public.venue_payments(id)
);
CREATE TABLE public.slot_hold_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slot_hold_id uuid NOT NULL,
  slot_instance_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT slot_hold_items_pkey PRIMARY KEY (id),
  CONSTRAINT slot_hold_items_slot_hold_id_fkey FOREIGN KEY (slot_hold_id) REFERENCES public.slot_holds(id),
  CONSTRAINT slot_hold_items_slot_instance_id_fkey FOREIGN KEY (slot_instance_id) REFERENCES public.slot_instances(id)
);
CREATE TABLE public.slot_holds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lock_token text NOT NULL UNIQUE,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'held'::slot_hold_status,
  verification_method text,
  verification_by uuid,
  verification_at timestamp with time zone,
  meta jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT slot_holds_pkey PRIMARY KEY (id),
  CONSTRAINT slot_holds_verification_by_fkey FOREIGN KEY (verification_by) REFERENCES auth.users(id)
);
CREATE TABLE public.slot_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slot_template_id uuid,
  court_id bigint NOT NULL,
  slot_date date NOT NULL,
  slot_number integer,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'free'::slot_status,
  blocked_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT slot_instances_pkey PRIMARY KEY (id),
  CONSTRAINT slot_instances_slot_template_id_fkey FOREIGN KEY (slot_template_id) REFERENCES public.slot_templates(id),
  CONSTRAINT slot_instances_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id)
);
CREATE TABLE public.slot_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id bigint NOT NULL UNIQUE,
  slot_duration_minutes integer NOT NULL CHECK (slot_duration_minutes = ANY (ARRAY[30, 60])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT slot_templates_pkey PRIMARY KEY (id),
  CONSTRAINT slot_templates_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id)
);
CREATE TABLE public.user_venues (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id bigint NOT NULL,
  role text DEFAULT 'staff'::text,
  invited_by uuid DEFAULT auth.uid(),
  invite_status character varying DEFAULT '''pending'''::character varying,
  is_active boolean NOT NULL DEFAULT true,
  name text,
  phone text,
  email text,
  CONSTRAINT user_venues_pkey PRIMARY KEY (id),
  CONSTRAINT user_vanues_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_vanues_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
  CONSTRAINT user_venues_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venue_invites (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  venue_id bigint NOT NULL,
  invited_email text NOT NULL,
  role text DEFAULT 'staff'::text,
  invited_token text,
  status text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT venue_invites_pkey PRIMARY KEY (id),
  CONSTRAINT vanue_invites_vanue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venue_payments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  provider_id text,
  name text,
  type text,
  currency text,
  is_active boolean,
  settlement_rules text,
  venue_id bigint NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  image_metadata json,
  account_number text,
  CONSTRAINT venue_payments_pkey PRIMARY KEY (id),
  CONSTRAINT venue_payments_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venues (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  slug character varying NOT NULL UNIQUE,
  phone text,
  address text DEFAULT ''::text,
  description text DEFAULT ''::text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  timezone text DEFAULT '''''''Asia/jakarta''''::text''::text'::text,
  is_active boolean,
  email text,
  CONSTRAINT venues_pkey PRIMARY KEY (id)
);