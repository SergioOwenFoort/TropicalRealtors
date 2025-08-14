const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSlides() {
  const { data, error } = await supabase.from('carousel_slides').select('unique_id, title, click_count, island').limit(10);
  console.log('Slides in database:', data);
  if (error) console.log('Error:', error);
}

checkSlides();
