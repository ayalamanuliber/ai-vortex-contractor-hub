import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export async function PATCH(request: NextRequest) {
  try {
    const { id, nombre } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log(`Updating nombre for contractor ${id} to: "${nombre || ''}"`);

    // Read the current CSV
    const csvPath = path.join(process.cwd(), 'public', 'data', 'contractors_original.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 500 });
    }

    // Find and update the contractor
    const contractors = parsed.data as any[];
    let contractorFound = false;
    
    for (let i = 0; i < contractors.length; i++) {
      const contractor = contractors[i];
      const contractorId = String(contractor.business_id).trim();
      
      // Match both with and without leading zeros
      if (contractorId === id || contractorId === id.padStart(5, '0') || contractorId.replace(/^0+/, '') === id.replace(/^0+/, '')) {
        contractor.nombre = nombre || '';
        contractorFound = true;
        console.log(`Found and updated contractor ${contractorId}: nombre = "${contractor.nombre}"`);
        break;
      }
    }

    if (!contractorFound) {
      return NextResponse.json({ 
        error: `Contractor with ID ${id} not found`,
        details: `Searched ${contractors.length} contractors`
      }, { status: 404 });
    }

    // Convert back to CSV
    const updatedCsv = Papa.unparse(contractors, {
      header: true,
      skipEmptyLines: true
    });

    // Write back to file
    await fs.writeFile(csvPath, updatedCsv, 'utf-8');
    console.log('CSV file updated successfully');

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