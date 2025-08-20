import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

interface Migration {
  filename: string;
  content: string;
}

interface DatabaseObject {
  type: 'table' | 'index' | 'constraint' | 'column';
  name: string;
  tableName?: string;
  sql: string;
  exists?: boolean;
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'migrations');
  }

  /**
   * Get all migration files sorted by filename
   */
  private getMigrationFiles(): Migration[] {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort alphabetically to ensure correct order

      return files.map(filename => ({
        filename,
        content: fs.readFileSync(path.join(this.migrationsPath, filename), 'utf8')
      }));
    } catch (error) {
      console.error('Error reading migration files:', error);
      return [];
    }
  }

  /**
   * Check if a table exists in the database
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      // Use direct SQL query to bypass PostgREST cache issues
      const { data, error } = await supabase.rpc('execute_sql_query', {
        sql_query: `
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          ) as table_exists
        `
      });
      
      if (error) {
        console.error(`❌ Erro ao verificar existência da tabela ${tableName}:`, error);
        return false;
      }
      
      // Parse JSON result
      const exists = data && Array.isArray(data) && data.length > 0 && data[0].table_exists === true;
      console.log(`🔍 Tabela ${tableName} existe: ${exists}`);
      return exists;
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
      return false;
    }
  }



  /**
   * Check if a column exists in a table
   */
  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      // Try using the RPC function first
      const { data, error } = await supabase
        .rpc('column_exists', { table_name: tableName, column_name: columnName });
      
      if (!error && data !== null) {
        return data;
      }
      
      // Fallback to direct query method
      const { error: queryError } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(1);
      
      // If no error, column exists
      if (!queryError) {
        return true;
      }
      
      // Check if error is about column not existing
      if (queryError.message && queryError.message.includes('column') && queryError.message.includes('does not exist')) {
        return false;
      }
      
      // For other errors, assume column exists to be safe
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if an index exists
   */
  private async indexExists(indexName: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      // Try using the RPC function first
      const { data, error } = await supabase
        .rpc('index_exists', { index_name: indexName });
      
      if (!error && data !== null) {
        return data;
      }
      
      // Fallback: assume index doesn't exist if we can't check
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse migration content to extract database objects
   */
  private parseMigrationContent(migration: Migration): DatabaseObject[] {
    const objects: DatabaseObject[] = [];
    const content = migration.content;
    
    // Extract CREATE TABLE statements
    const tableMatches = content.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi);
    if (tableMatches) {
      tableMatches.forEach(match => {
        const tableName = match.replace(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+/i, '').replace(/\s*\(.*/, '').trim();
        objects.push({
          type: 'table',
          name: tableName,
          sql: this.extractTableDefinition(content, tableName)
        });
      });
    }
    
    // Extract ALTER TABLE ADD COLUMN statements
    const alterMatches = content.match(/ALTER TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+ADD COLUMN(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (alterMatches) {
      alterMatches.forEach(match => {
        const parts = match.match(/ALTER TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+ADD COLUMN(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (parts) {
          const tableName = parts[1];
          const columnName = parts[2];
          const fullStatement = this.extractAlterStatement(content, tableName, columnName);
          objects.push({
            type: 'column',
            name: columnName,
            tableName,
            sql: fullStatement
          });
        }
      });
    }
    
    // Extract CREATE INDEX statements
    const indexMatches = content.match(/CREATE(?:\s+UNIQUE)?\s+INDEX(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+ON/gi);
    if (indexMatches) {
      indexMatches.forEach(match => {
        const indexName = match.replace(/CREATE(?:\s+UNIQUE)?\s+INDEX(?:\s+IF NOT EXISTS)?\s+/i, '').replace(/\s+ON.*/, '').trim();
        const fullStatement = this.extractIndexDefinition(content, indexName);
        const tableName = this.extractTableFromIndex(fullStatement);
        objects.push({
          type: 'index',
          name: indexName,
          tableName,
          sql: fullStatement
        });
      });
    }
    
    // Extract INSERT statements
    const insertMatches = content.match(/INSERT INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (insertMatches) {
      insertMatches.forEach(match => {
        const tableName = match.replace(/INSERT INTO\s+/i, '').trim();
        const insertStatement = this.extractInsertStatement(content, tableName);
        objects.push({
          type: 'constraint', // Using constraint type for data inserts
          name: `data_${tableName}`,
          tableName,
          sql: insertStatement
        });
      });
    }
    
    return objects;
  }

  /**
   * Extract table definition from migration content
   */
  private extractTableDefinition(content: string, tableName: string): string {
    const regex = new RegExp(`CREATE TABLE(?:\\s+IF NOT EXISTS)?\\s+${tableName}\\s*\\([^;]*\\);`, 'gi');
    const match = content.match(regex);
    return match ? match[0] : '';
  }

  /**
   * Extract ALTER TABLE statement from migration content
   */
  private extractAlterStatement(content: string, tableName: string, columnName: string): string {
    const regex = new RegExp(`ALTER TABLE\\s+${tableName}\\s+ADD COLUMN(?:\\s+IF NOT EXISTS)?\\s+${columnName}[^;]*;`, 'i');
    const match = content.match(regex);
    return match ? match[0] : '';
  }

  /**
   * Extract index definition from migration content
   */
  private extractIndexDefinition(content: string, indexName: string): string {
    const regex = new RegExp(`CREATE(?:\\s+UNIQUE)?\\s+INDEX(?:\\s+IF NOT EXISTS)?\\s+${indexName}[^;]*;`, 'gi');
    const match = content.match(regex);
    return match ? match[0] : '';
  }

  /**
   * Extract table name from index definition
   */
  private extractTableFromIndex(indexSql: string): string {
    const match = indexSql.match(/ON\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
    return match ? match[1] : '';
  }

  /**
   * Extract INSERT statement from migration content
   */
  private extractInsertStatement(content: string, tableName: string): string {
    const regex = new RegExp(`INSERT INTO\\s+${tableName}[^;]*;`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.join('\n') : '';
  }

  /**
   * Check if migrations table exists and create if not
   */
  private async ensureMigrationsTable(): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      // Try to query the migrations table
      const { error } = await supabase
        .from('migrations')
        .select('filename')
        .limit(1);

      if (error && error.message.includes('relation "migrations" does not exist')) {
        console.log('🔧 Creating migrations table...');
        
        // Try to create the migrations table using direct SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        const success = await this.executeSQL(createTableSQL);
        if (success) {
          console.log('✅ Migrations table created successfully');
          return true;
        } else {
          console.log('❌ Failed to create migrations table automatically');
          // Read and show the migrations table creation script for manual execution
          try {
            const migrationTableScript = fs.readFileSync(
              path.join(this.migrationsPath, '000_create_migrations_table.sql'),
              'utf8'
            );
            console.log('Please execute the following SQL manually in your Supabase SQL editor:');
            console.log('\n' + '='.repeat(50));
            console.log(migrationTableScript);
            console.log('='.repeat(50) + '\n');
          } catch (fileError) {
            console.log('Please execute the following SQL manually in your Supabase SQL editor:');
            console.log('\n' + '='.repeat(50));
            console.log(createTableSQL);
            console.log('='.repeat(50) + '\n');
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking migrations table:', error);
      return false;
    }
  }

  /**
   * Get list of already executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      if (!supabase) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('migrations')
        .select('filename');

      if (error) {
        console.error('Error getting executed migrations:', error);
        return [];
      }

      return data?.map(row => row.filename) || [];
    } catch (error) {
      console.error('Error getting executed migrations:', error);
      return [];
    }
  }

  /**
   * Record a migration as executed
   */
  private async recordMigration(filename: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      const { error } = await supabase
        .from('migrations')
        .insert({ filename });

      if (error && error.message && !error.message.includes('duplicate key')) {
        console.error(`Error recording migration ${filename}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error recording migration ${filename}:`, error);
      return false;
    }
  }

  /**
   * Display migration SQL for manual execution
   */
  private displayMigrationSQL(migration: Migration): void {
    console.log(`\n📋 Migration: ${migration.filename}`);
    console.log('=' .repeat(60));
    console.log(migration.content);
    console.log('=' .repeat(60));
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Starting database migrations...');

      // Check if migrations table exists
      const migrationsTableExists = await this.ensureMigrationsTable();
      if (!migrationsTableExists) {
        console.log('❌ Migrations table does not exist. Please create it manually first.');
        return;
      }

      const allMigrations = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(migration => {
        console.log(`  - ${migration.filename}`);
      });

      console.log('\n🔍 Analyzing and executing migrations automatically...');
      
      // Execute each migration automatically
      for (const migration of pendingMigrations) {
        const success = await this.executeMigration(migration);
        if (success) {
          await this.recordMigration(migration.filename);
          console.log(`✅ Migration ${migration.filename} executed successfully`);
        } else {
          console.log(`❌ Migration ${migration.filename} failed to execute`);
        }
      }

      console.log('\n✅ All migrations have been processed automatically.');
      
    } catch (error) {
      console.error('❌ Error running migrations:', error);
    }
  }

  /**
   * Execute a migration automatically
   */
  private async executeMigration(migration: Migration): Promise<boolean> {
    try {
      console.log(`\n📋 Executing migration: ${migration.filename}`);
      console.log('=' .repeat(60));
      
      const objects = this.parseMigrationContent(migration);
      let allSuccess = true;
      
      for (const obj of objects) {
        let needsExecution = false;
        
        switch (obj.type) {
          case 'table':
            const tableExists = await this.tableExists(obj.name);
            if (!tableExists) {
              needsExecution = true;
              console.log(`🔧 Creating table '${obj.name}'...`);
            } else {
              console.log(`✅ Table '${obj.name}' already exists - skipping`);
            }
            break;
            
          case 'column':
            if (obj.tableName) {
              const columnExists = await this.columnExists(obj.tableName, obj.name);
              if (!columnExists) {
                needsExecution = true;
                console.log(`🔧 Adding column '${obj.name}' to table '${obj.tableName}'...`);
              } else {
                console.log(`✅ Column '${obj.name}' in table '${obj.tableName}' already exists - skipping`);
              }
            }
            break;
            
          case 'index':
            const indexExists = await this.indexExists(obj.name);
            if (!indexExists) {
              needsExecution = true;
              console.log(`🔧 Creating index '${obj.name}'...`);
            } else {
              console.log(`✅ Index '${obj.name}' already exists - skipping`);
            }
            break;
            
          case 'constraint':
            // For data inserts, check if table has data
            if (obj.tableName) {
              const hasData = await this.tableHasData(obj.tableName);
              if (!hasData) {
                needsExecution = true;
                console.log(`🔧 Inserting data into table '${obj.tableName}'...`);
              } else {
                console.log(`✅ Table '${obj.tableName}' has data - skipping inserts`);
              }
            }
            break;
        }
        
        if (needsExecution && obj.sql) {
          const success = await this.executeSQL(obj.sql);
          if (!success) {
            console.log(`❌ Failed to execute: ${obj.sql.substring(0, 100)}...`);
            allSuccess = false;
          } else {
            console.log(`✅ Successfully executed SQL`);
          }
        }
      }
      
      console.log('=' .repeat(60));
      return allSuccess;
    } catch (error) {
      console.error(`Error executing migration ${migration.filename}:`, error);
      return false;
    }
  }

  /**
    * Execute SQL using Supabase RPC
    */
   private async executeSQL(sql: string): Promise<boolean> {
     try {
       if (!supabase) {
         console.error('Supabase client not initialized');
         return false;
       }
       
       // Parse SQL to determine the operation type
       const sqlUpper = sql.trim().toUpperCase();
       
       if (sqlUpper.startsWith('CREATE TABLE')) {
         return await this.executeCreateTable(sql);
       } else if (sqlUpper.startsWith('ALTER TABLE')) {
         return await this.executeAlterTable(sql);
       } else if (sqlUpper.startsWith('CREATE INDEX')) {
         return await this.executeCreateIndex(sql);
       } else if (sqlUpper.startsWith('INSERT INTO')) {
         return await this.executeInsert(sql);
       } else if (sqlUpper.startsWith('CREATE OR REPLACE FUNCTION')) {
         return await this.executeCreateFunction(sql);
       } else {
         console.log('⚠️  Unsupported SQL operation. Please execute manually:');
         console.log('-'.repeat(60));
         console.log(sql);
         console.log('-'.repeat(60));
         return false;
       }
     } catch (error) {
       console.error('Error executing SQL:', error);
       return false;
     }
   }

  /**
   * Execute CREATE TABLE statements using Supabase API
   */
  private async executeCreateTable(sql: string): Promise<boolean> {
    try {
      // Extract table name and columns from CREATE TABLE statement
      const tableMatch = sql.match(/CREATE TABLE\s+(\w+)\s*\(/i);
      if (!tableMatch) {
        console.error('Could not parse table name from SQL');
        return false;
      }
      
      const tableName = tableMatch[1];
      
      // For CREATE TABLE, we'll use RPC with a fallback
       try {
         if (!supabase) {
           throw new Error('Supabase client not initialized');
         }
         const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (error && error.code !== 'PGRST202') {
          console.error('SQL execution error:', error);
          return false;
        }
        if (error && error.code === 'PGRST202') {
          throw new Error('RPC not available');
        }
        return true;
      } catch {
        // Fallback: show manual execution instructions
        console.log('⚠️  Please execute the following SQL manually in Supabase SQL Editor:');
        console.log('-'.repeat(60));
        console.log(sql);
        console.log('-'.repeat(60));
        return false;
      }
    } catch (error) {
      console.error('Error executing CREATE TABLE:', error);
      return false;
    }
  }

  /**
   * Execute ALTER TABLE statements
   */
  private async executeAlterTable(sql: string): Promise<boolean> {
    try {
      // For ALTER TABLE, we'll use RPC with a fallback
       try {
         if (!supabase) {
           throw new Error('Supabase client not initialized');
         }
         const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (error && error.code !== 'PGRST202') {
          console.error('SQL execution error:', error);
          return false;
        }
        if (error && error.code === 'PGRST202') {
          throw new Error('RPC not available');
        }
        return true;
      } catch {
        // Fallback: show manual execution instructions
        console.log('⚠️  Please execute the following SQL manually in Supabase SQL Editor:');
        console.log('-'.repeat(60));
        console.log(sql);
        console.log('-'.repeat(60));
        return false;
      }
    } catch (error) {
      console.error('Error executing ALTER TABLE:', error);
      return false;
    }
  }

  /**
   * Execute CREATE INDEX statements
   */
  private async executeCreateIndex(sql: string): Promise<boolean> {
    try {
      // For CREATE INDEX, we'll use RPC with a fallback
       try {
         if (!supabase) {
           throw new Error('Supabase client not initialized');
         }
         const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (error && error.code !== 'PGRST202') {
          console.error('SQL execution error:', error);
          return false;
        }
        if (error && error.code === 'PGRST202') {
          throw new Error('RPC not available');
        }
        return true;
      } catch {
        // Fallback: show manual execution instructions
        console.log('⚠️  Please execute the following SQL manually in Supabase SQL Editor:');
        console.log('-'.repeat(60));
        console.log(sql);
        console.log('-'.repeat(60));
        return false;
      }
    } catch (error) {
      console.error('Error executing CREATE INDEX:', error);
      return false;
    }
  }

  /**
   * Execute INSERT statements using Supabase client
   */
  private async executeInsert(sql: string): Promise<boolean> {
    try {
      // Extract table name and values from INSERT statement
      const insertMatch = sql.match(/INSERT INTO\s+(\w+)/i);
      if (!insertMatch) {
        console.error('Could not parse table name from INSERT statement');
        return false;
      }
      
      const tableName = insertMatch[1];
      
      // For simple INSERT statements, try to use Supabase client
      if (sql.includes('VALUES')) {
        // Try RPC first, fallback to manual
         try {
           if (!supabase) {
             throw new Error('Supabase client not initialized');
           }
           const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
          if (error && error.code !== 'PGRST202') {
            console.error('SQL execution error:', error);
            return false;
          }
          if (error && error.code === 'PGRST202') {
            throw new Error('RPC not available');
          }
          return true;
        } catch {
          // Fallback: show manual execution instructions
          console.log('⚠️  Please execute the following SQL manually in Supabase SQL Editor:');
          console.log('-'.repeat(60));
          console.log(sql);
          console.log('-'.repeat(60));
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error executing INSERT:', error);
      return false;
    }
  }

  /**
   * Execute CREATE FUNCTION statements
   */
  private async executeCreateFunction(sql: string): Promise<boolean> {
    try {
      // For CREATE FUNCTION, we'll use RPC with a fallback
       try {
         if (!supabase) {
           throw new Error('Supabase client not initialized');
         }
         const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (error && error.code !== 'PGRST202') {
          console.error('SQL execution error:', error);
          return false;
        }
        if (error && error.code === 'PGRST202') {
          throw new Error('RPC not available');
        }
        return true;
      } catch {
        // Fallback: show manual execution instructions
        console.log('⚠️  Please execute the following SQL manually in Supabase SQL Editor:');
        console.log('-'.repeat(60));
        console.log(sql);
        console.log('-'.repeat(60));
        return false;
      }
    } catch (error) {
      console.error('Error executing CREATE FUNCTION:', error);
      return false;
    }
  }

  /**
   * Analyze a migration and display only the SQL that needs to be executed
   */
  private async analyzeMigration(migration: Migration): Promise<void> {
    console.log(`\n📋 Migration: ${migration.filename}`);
    console.log('=' .repeat(60));
    
    const objects = this.parseMigrationContent(migration);
    const requiredSQL: string[] = [];
    
    for (const obj of objects) {
      let needsExecution = false;
      
      switch (obj.type) {
        case 'table':
          const tableExists = await this.tableExists(obj.name);
          if (!tableExists) {
            needsExecution = true;
            console.log(`🔧 Table '${obj.name}' does not exist - will be created`);
          } else {
            console.log(`✅ Table '${obj.name}' already exists - skipping`);
          }
          break;
          
        case 'column':
          if (obj.tableName) {
            const columnExists = await this.columnExists(obj.tableName, obj.name);
            if (!columnExists) {
              needsExecution = true;
              console.log(`🔧 Column '${obj.name}' in table '${obj.tableName}' does not exist - will be added`);
            } else {
              console.log(`✅ Column '${obj.name}' in table '${obj.tableName}' already exists - skipping`);
            }
          }
          break;
          
        case 'index':
          const indexExists = await this.indexExists(obj.name);
          if (!indexExists) {
            needsExecution = true;
            console.log(`🔧 Index '${obj.name}' does not exist - will be created`);
          } else {
            console.log(`✅ Index '${obj.name}' already exists - skipping`);
          }
          break;
          
        case 'constraint':
          // For data inserts, check if table has data
          if (obj.tableName) {
            const hasData = await this.tableHasData(obj.tableName);
            if (!hasData) {
              needsExecution = true;
              console.log(`🔧 Table '${obj.tableName}' is empty - data will be inserted`);
            } else {
              console.log(`✅ Table '${obj.tableName}' has data - skipping inserts`);
            }
          }
          break;
      }
      
      if (needsExecution && obj.sql) {
        requiredSQL.push(obj.sql);
      }
    }
    
    if (requiredSQL.length > 0) {
      console.log('\n🔧 Required SQL to execute:');
      console.log('-'.repeat(40));
      requiredSQL.forEach(sql => {
        console.log(sql);
        console.log('');
      });
    } else {
      console.log('\n✅ All objects already exist - migration can be marked as completed');
    }
    
    console.log('=' .repeat(60));
  }

  /**
   * Check if a table has data
   */
  private async tableHasData(tableName: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark migrations as executed (for manual execution workflow)
   */
  public async markMigrationsAsExecuted(): Promise<void> {
    try {
      const allMigrations = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      );

      if (pendingMigrations.length === 0) {
        return;
      }

      console.log('🔍 Checking for manually executed migrations...');
      
      // For each pending migration, try to verify if tables/data exist
      for (const migration of pendingMigrations) {
        if (await this.verifyMigrationExecuted(migration)) {
          await this.recordMigration(migration.filename);
          console.log(`✅ Marked ${migration.filename} as executed`);
        }
      }
    } catch (error) {
      console.error('Error marking migrations as executed:', error);
    }
  }

  /**
   * Verify if a migration has been manually executed
   */
  private async verifyMigrationExecuted(migration: Migration): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      
      // Simple verification: check if migration creates tables that now exist
      if (migration.content.includes('CREATE TABLE')) {
        const tableMatches = migration.content.match(/CREATE TABLE.*?([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (tableMatches) {
          for (const match of tableMatches) {
            const tableName = match.replace(/CREATE TABLE.*?IF NOT EXISTS\s+/, '').replace(/CREATE TABLE\s+/, '').split('(')[0].trim();
            
            // Try to query the table
            const { error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (error && error.message.includes('does not exist')) {
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const migrationRunner = new MigrationRunner();