import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function PATCH(request: NextRequest) {
  try {
    const { id, nombre } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Call the sync system to update the nombre field
    const syncScriptPath = path.join(process.cwd(), '..', '..', '02_CAMPAIGN_GENERATOR', 'scripts', 'sync_system.py');
    const command = `python3 "${syncScriptPath}" --update-nombre "${id}" "${nombre || ''}"`;
    
    console.log('Executing sync command:', command);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Sync script stderr:', stderr);
      // Don't fail on stderr as it might just be warnings
    }
    
    console.log('Sync script output:', stdout);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Nombre updated successfully',
      id,
      nombre: nombre || ''
    });

  } catch (error) {
    console.error('Error updating nombre:', error);
    return NextResponse.json(
      { error: 'Failed to update nombre', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}