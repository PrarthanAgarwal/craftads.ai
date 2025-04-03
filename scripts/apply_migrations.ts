import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
console.log(`Service key available: ${supabaseServiceKey ? 'Yes' : 'No'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to create the tables
async function createTables() {
  try {
    // Read the gallery templates migration
    const galleryMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20230403_gallery_templates.sql');
    console.log(`Reading migration file: ${galleryMigrationPath}`);
    
    if (!fs.existsSync(galleryMigrationPath)) {
      throw new Error(`Migration file not found: ${galleryMigrationPath}`);
    }
    
    const galleryMigrationSQL = fs.readFileSync(galleryMigrationPath, 'utf8');
    
    // Split the SQL into statements (naive implementation, but should work for most cases)
    const statements = galleryMigrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      try {
        const { error } = await supabase.rpc('exec', { query: stmt });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.log('SQL:', stmt);
          // Continue with next statement
        } else {
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Continue with next statement
      }
    }
    
    // Now add the transaction functions
    const transactionMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20230404_transaction_functions.sql');
    console.log(`Reading migration file: ${transactionMigrationPath}`);
    
    if (!fs.existsSync(transactionMigrationPath)) {
      throw new Error(`Migration file not found: ${transactionMigrationPath}`);
    }
    
    const transactionMigrationSQL = fs.readFileSync(transactionMigrationPath, 'utf8');
    
    // Split the SQL into statements
    const transactionStatements = transactionMigrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${transactionStatements.length} SQL statements to execute for transaction functions`);
    
    // Execute each statement
    for (let i = 0; i < transactionStatements.length; i++) {
      const stmt = transactionStatements[i];
      console.log(`Executing transaction function statement ${i + 1}/${transactionStatements.length}`);
      
      try {
        const { error } = await supabase.rpc('exec', { query: stmt });
        
        if (error) {
          console.error(`Error executing transaction function statement ${i + 1}:`, error);
          console.log('SQL:', stmt);
          // Continue with next statement
        } else {
          console.log(`Successfully executed transaction function statement ${i + 1}`);
        }
      } catch (error) {
        console.error(`Error executing transaction function statement ${i + 1}:`, error);
        // Continue with next statement
      }
    }
    
    console.log('All migrations completed');
  } catch (error) {
    console.error('Error during migration process:', error);
    process.exit(1);
  }
}

// For direct access to the database, we need to use a database connection that supports
// executing arbitrary SQL. This might require a server-side API endpoint or a Supabase
// function that has proper permissions. This example assumes there's an RPC function
// called 'exec' that can execute SQL.

// Check if tables exist
async function checkTablesExist() {
  const { data, error } = await supabase
    .from('template_categories')
    .select('count(*)')
    .limit(1);
  
  if (error) {
    console.log('Tables don\'t exist yet:', error.message);
    return false;
  }
  
  console.log('Tables already exist');
  return true;
}

// Main function
async function main() {
  try {
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('Tables don\'t exist. Creating...');
      await createTables();
    } else {
      console.log('Tables already exist. No need to create them.');
    }
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error); 