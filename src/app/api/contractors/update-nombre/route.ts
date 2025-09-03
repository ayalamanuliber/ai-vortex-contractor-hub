import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface NombreChanges {
  changes: { [contractorId: string]: string };
  last_updated: string | null;
  version: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, nombre } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log(`Saving nombre change for contractor ${id}: "${nombre || ''}"`);

    // Read existing changes
    const changesPath = path.join(process.cwd(), 'public', 'data', 'nombre_changes.json');
    let changesData: NombreChanges;
    
    try {
      const existingContent = await fs.readFile(changesPath, 'utf-8');
      changesData = JSON.parse(existingContent);
    } catch (error) {
      // Create new structure if file doesn't exist
      changesData = {
        changes: {},
        last_updated: null,
        version: "1.0"
      };
    }

    // Update the change
    const normalizedId = String(id).trim();
    if (nombre && nombre.trim()) {
      changesData.changes[normalizedId] = nombre.trim();
    } else {
      // Remove the entry if nombre is empty
      delete changesData.changes[normalizedId];
    }
    
    changesData.last_updated = new Date().toISOString();

    // Save changes
    await fs.writeFile(changesPath, JSON.stringify(changesData, null, 2), 'utf-8');
    console.log(`Saved nombre change to temporary storage: ${normalizedId} = "${nombre || ''}"`);

    return NextResponse.json({ 
      success: true, 
      message: 'Nombre change saved (will sync on next sync operation)',
      id: normalizedId,
      nombre: nombre || '',
      pending_sync: true
    });

  } catch (error) {
    console.error('Error saving nombre change:', error);
    return NextResponse.json(
      { error: 'Failed to save nombre change', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current changes
export async function GET() {
  try {
    const changesPath = path.join(process.cwd(), 'public', 'data', 'nombre_changes.json');
    
    try {
      const content = await fs.readFile(changesPath, 'utf-8');
      const changesData = JSON.parse(content);
      return NextResponse.json(changesData);
    } catch (error) {
      return NextResponse.json({
        changes: {},
        last_updated: null,
        version: "1.0"
      });
    }
  } catch (error) {
    console.error('Error reading nombre changes:', error);
    return NextResponse.json(
      { error: 'Failed to read nombre changes' },
      { status: 500 }
    );
  }
}