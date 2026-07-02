const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:MSMDev2026**@db.vcfevlpoqwnsvkwfoprv.supabase.co:5432/postgres';

const sql = `
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
`;

async function main() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  console.log('Conectado a Supabase production');

  try {
    console.log('Creando tabla settings si no existe...');
    await client.query(sql);
    console.log('OK - settings table lista');
  } catch (e) {
    console.error('ERROR:', e.message);
  }

  await client.end();
  console.log('Listo');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
