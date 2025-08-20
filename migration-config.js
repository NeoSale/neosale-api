/**
 * Configuração para execução de migrações em múltiplas bases de dados Supabase
 * Este arquivo permite executar migrações tanto na base NeoSale quanto na base OMIE
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Cria cliente Supabase para uma base específica
 * @param {string} dbKey - Chave da base de dados (neosale ou omie)
 * @returns {Object} Cliente Supabase configurado
 */
function createSupabaseClient(dbKey) {
  const config = databases[dbKey];
  if (!config) {
    throw new Error(`Base de dados '${dbKey}' não encontrada. Use: ${Object.keys(databases).join(', ')}`);
  }
  
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false
    }
  });
}

/**
 * Lê todos os arquivos de migração do diretório migrations
 * @returns {Array} Lista de arquivos de migração ordenados
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    throw new Error('Diretório migrations não encontrado');
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ordena alfabeticamente para executar na ordem correta
}

/**
 * Executa uma migração SQL em uma base específica
 * @param {Object} supabase - Cliente Supabase
 * @param {string} migrationFile - Nome do arquivo de migração
 * @param {string} dbName - Nome da base de dados
 */
async function executeMigration(supabase, migrationFile, dbName) {
  try {
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`[${dbName}] Executando migração: ${migrationFile}`);
    
    // Para arquivos com funções PL/pgSQL, executa o arquivo inteiro
    // Para outros arquivos, divide em statements individuais
    if (sqlContent.includes('$$') || sqlContent.includes('LANGUAGE plpgsql') || sqlContent.includes('$constraint$') || sqlContent.includes('$fk_constraints$') || sqlContent.includes('$add_constraints$')) {
      // Executa o arquivo inteiro para funções PL/pgSQL
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: sqlContent
      });
      
      if (error) {
        console.error(`[${dbName}] Erro ao executar migração:`, error);
        throw error;
      }
    } else {
      // Divide o conteúdo SQL em statements individuais
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Executa cada statement
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('execute_sql', {
            sql_query: statement
          });
          
          if (error) {
            console.error(`[${dbName}] Erro ao executar statement:`, error);
            throw error;
          }
        }
      }
    }
    
    console.log(`[${dbName}] ✅ Migração ${migrationFile} executada com sucesso`);
    
  } catch (error) {
    console.error(`[${dbName}] ❌ Erro na migração ${migrationFile}:`, error.message);
    throw error;
  }
}

/**
 * Executa todas as migrações em uma base específica
 * @param {string} dbKey - Chave da base de dados
 */
async function runMigrationsForDatabase(dbKey) {
  const config = databases[dbKey];
  const supabase = createSupabaseClient(dbKey);
  const migrationFiles = getMigrationFiles();
  
  console.log(`\n🚀 Iniciando migrações para ${config.name}`);
  console.log(`📊 Total de migrações: ${migrationFiles.length}`);
  
  for (const migrationFile of migrationFiles) {
    await executeMigration(supabase, migrationFile, config.name);
  }
  
  console.log(`\n✅ Todas as migrações foram executadas com sucesso em ${config.name}`);
}

/**
 * Executa migrações em todas as bases de dados
 */
async function runAllMigrations() {
  console.log('🔄 Iniciando execução de migrações em todas as bases de dados...');
  
  for (const dbKey of Object.keys(databases)) {
    try {
      await runMigrationsForDatabase(dbKey);
    } catch (error) {
      console.error(`❌ Falha ao executar migrações em ${databases[dbKey].name}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 Todas as migrações foram executadas com sucesso em todas as bases!');
}

/**
 * Executa migração específica em uma base específica
 * @param {string} dbKey - Chave da base de dados
 * @param {string} migrationFile - Nome do arquivo de migração
 */
async function runSpecificMigration(dbKey, migrationFile) {
  const config = databases[dbKey];
  const supabase = createSupabaseClient(dbKey);
  
  console.log(`🔄 Executando migração específica: ${migrationFile} em ${config.name}`);
  
  await executeMigration(supabase, migrationFile, config.name);
  
  console.log(`✅ Migração ${migrationFile} executada com sucesso em ${config.name}`);
}

// Função principal para execução via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Executa todas as migrações em todas as bases
    await runAllMigrations();
  } else if (args.length === 1) {
    // Executa todas as migrações em uma base específica
    const dbKey = args[0];
    await runMigrationsForDatabase(dbKey);
  } else if (args.length === 2) {
    // Executa migração específica em base específica
    const [dbKey, migrationFile] = args;
    await runSpecificMigration(dbKey, migrationFile);
  } else {
    console.log('Uso:');
    console.log('  node migration-config.js                    # Executa todas as migrações em todas as bases');
    console.log('  node migration-config.js <database>         # Executa todas as migrações em uma base específica');
    console.log('  node migration-config.js <database> <file>  # Executa migração específica em base específica');
    console.log('');
    console.log('Bases disponíveis:', Object.keys(databases).join(', '));
    process.exit(1);
  }
}

// Exporta funções para uso em outros módulos
module.exports = {
  databases,
  createSupabaseClient,
  runMigrationsForDatabase,
  runAllMigrations,
  runSpecificMigration,
  getMigrationFiles
};

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}