"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey ||
    supabaseUrl.includes('your-project') ||
    supabaseAnonKey.includes('your_supabase')) {
    console.error('❌ Supabase Configuration Error:');
    console.error('Please configure real Supabase credentials in your .env file');
    console.error('Current values:');
    console.error(`  SUPABASE_URL: ${supabaseUrl || 'undefined'}`);
    console.error(`  SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[SET]' : 'undefined'}`);
    console.error('');
    console.error('To fix this:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project (or create one)');
    console.error('3. Go to Settings > API');
    console.error('4. Copy the URL and anon key to your .env file');
    console.error('5. Replace the placeholder values with real ones');
    throw new Error('Missing or invalid Supabase environment variables');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
//# sourceMappingURL=supabase.js.map