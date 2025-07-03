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
    console.warn('⚠️  Supabase Configuration Warning:');
    console.warn('Supabase credentials not configured. Database operations will not work.');
    console.warn('To configure Supabase:');
    console.warn('1. Go to https://supabase.com/dashboard');
    console.warn('2. Select your project (or create one)');
    console.warn('3. Go to Settings > API');
    console.warn('4. Copy the URL and anon key to your .env file');
    console.warn('5. Replace the placeholder values with real ones');
    console.warn('');
}
// Criar cliente Supabase apenas se as credenciais estiverem configuradas
exports.supabase = (!supabaseUrl || !supabaseAnonKey ||
    supabaseUrl.includes('your-project') ||
    supabaseAnonKey.includes('your_supabase'))
    ? null
    : (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
//# sourceMappingURL=supabase.js.map