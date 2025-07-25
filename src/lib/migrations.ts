import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

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
      // Try using the RPC function first
      const { data, error } = await supabase
        .rpc('table_exists', { table_name: tableName });
      
      if (!error && data !== null) {
        return data;
      }
      
      // Fallback to direct query method
      const { error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !queryError || !queryError.message.includes('does not exist');
    } catch (error) {
      return false;
    }
  }



  /**
   * Check if a column exists in a table
   */
  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
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
      // Try to query the migrations table
      const { error } = await supabase
        .from('migrations')
        .select('filename')
        .limit(1);

      if (error && error.message.includes('relation "migrations" does not exist')) {
        console.log('Creating migrations table...');
        // Read and execute the migrations table creation script
        const migrationTableScript = fs.readFileSync(
          path.join(this.migrationsPath, '000_create_migrations_table.sql'),
          'utf8'
        );
        
        // For now, we'll log the SQL that needs to be executed manually
        console.log('Please execute the following SQL manually in your Supabase SQL editor:');
        console.log('\n' + '='.repeat(50));
        console.log(migrationTableScript);
        console.log('='.repeat(50) + '\n');
        
        return false;
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
       // Use Supabase RPC to execute raw SQL
       const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
       
       if (error) {
         // If RPC function doesn't exist, show manual execution instructions
         if (error.code === 'PGRST202') {
           console.log('\n⚠️  Automatic execution not available. Please execute the following SQL manually:');
           console.log('-'.repeat(60));
           console.log(sql);
           console.log('-'.repeat(60));
           console.log('\n📝 To enable automatic execution, run the setup_supabase_functions.sql script in your Supabase SQL Editor.');
           return false;
         }
         
         console.error('SQL execution error:', error);
         return false;
       }
       
       return true;
     } catch (error) {
       console.error('Error executing SQL:', error);
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