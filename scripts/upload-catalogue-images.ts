/**
 * Uploads the catalogue images in seed/images/ to the private `product-images` bucket,
 * at catalogue/<file>, matching the image_paths set by the 20261102 migration.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:images
 *
 * Existing files are skipped, so it is safe to re-run.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const dir = join(process.cwd(), 'seed', 'images');

(async () => {
  for (const file of readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const { error } = await sb.storage
      .from('product-images')
      .upload(`catalogue/${file}`, readFileSync(join(dir, file)), { contentType: 'image/jpeg', upsert: false });
    if (error && !/exists|duplicate/i.test(error.message)) {
      console.error(`✗ ${file}: ${error.message}`);
      process.exitCode = 1;
    } else console.log(`${error ? '•' : '✓'} catalogue/${file}${error ? ' (already present)' : ''}`);
  }
})();
