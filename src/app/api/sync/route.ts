import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    const syncScriptPath = path.join(process.cwd(), 'scripts', 'sync_system.py');
    
    let command = '';
    let description = '';
    
    switch (action) {
      case 'csv':
        command = `python3 "${syncScriptPath}" --sync-master-to-working`;
        description = 'Syncing Master CSV to Working CSV';
        break;
      
      case 'campaigns':
        command = `python3 "${syncScriptPath}" --sync-campaigns`;
        description = 'Syncing Campaign JSON files';
        break;
      
      case 'full':
        command = `python3 "${syncScriptPath}" --full-sync`;
        description = 'Performing full system sync';
        break;
      
      case 'status':
        command = `python3 "${syncScriptPath}" --status`;
        description = 'Getting system status';
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    console.log(`🔄 ${description}...`);
    console.log('Executing sync command:', command);
    
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    
    if (stderr) {
      console.error('Sync script stderr:', stderr);
    }
    
    console.log('Sync script output:', stdout);
    
    return NextResponse.json({ 
      success: true, 
      message: `${description} completed successfully`,
      action,
      output: stdout,
      stderr: stderr || null
    });

  } catch (error) {
    console.error('Error in sync operation:', error);
    return NextResponse.json(
      { error: 'Sync operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick status check
export async function GET() {
  try {
    const syncScriptPath = path.join(process.cwd(), 'scripts', 'sync_system.py');
    const command = `python3 "${syncScriptPath}" --status`;
    
    const { stdout, stderr } = await execAsync(command, { timeout: 15000 });
    
    return NextResponse.json({ 
      success: true, 
      status: stdout,
      stderr: stderr || null
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}