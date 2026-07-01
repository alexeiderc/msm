-- Migration: WhatsApp Cart Flow
-- Tabla para carritos enviados a WhatsApp

CREATE TABLE IF NOT EXISTS whatsapp_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    delivery_province TEXT,
    delivery_municipality TEXT,
    beneficiary_name TEXT,
    beneficiary_phone TEXT,
    total_amount DECIMAL(14, 2) NOT NULL,
    whatsapp_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enviado',
    tracking_code TEXT,
    fee_amount DECIMAL(14, 2),
    admin_notes TEXT,
    admin_link TEXT,
    viewed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_carts_user_id ON whatsapp_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_carts_status ON whatsapp_carts(status);
