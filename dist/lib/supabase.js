"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
// Carregar variáveis de ambiente
dotenv.config();
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