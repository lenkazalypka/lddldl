// check-env.js
console.log('=== ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `✅ (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} символов)` : '❌');
console.log('==============================');