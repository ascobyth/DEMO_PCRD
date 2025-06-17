import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AppTech from '@/models/AppTech';

export async function GET() {
  try {
    await dbConnect();

    // Try to fetch with population first, but handle the case where related models don't exist
    let appTechs;
    try {
      appTechs = await AppTech.find({})
        .populate({
          path: 'commercialSamples',
          select: 'gradeName application polymerType isActive'
        })
        .sort({ appTech: 1 });
    } catch (populateError) {
      console.warn('Error populating app techs with commercial samples:', populateError.message);
      // Fall back to fetching without population
      appTechs = await AppTech.find({}).sort({ appTech: 1 });
    }

    // If no app techs found, create some default ones for testing
    if (appTechs.length === 0) {
      console.warn('No AppTech entries found in database, creating default entries for testing');

      // Default Tech/CAT entries
      const defaultTechCat = [
        { appTech: 'EcoRv', shortText: 'EcoRv', appTechType: 'Tech', isActive: true },
        { appTech: 'HighPerf', shortText: 'HighPerf', appTechType: 'Tech', isActive: true },
        { appTech: 'BioAdd', shortText: 'BioAdd', appTechType: 'CATALYST', isActive: true },
        { appTech: 'RecyTech', shortText: 'RecyTech', appTechType: 'Tech', isActive: true },
        { appTech: 'NanoComp', shortText: 'NanoComp', appTechType: 'CATALYST', isActive: true }
      ];

      // Default Feature/App entries
      const defaultFeatureApp = [
        { appTech: 'Advanced Technology', shortText: 'AT', appTechType: 'Application', isActive: true },
        { appTech: 'Film Processing', shortText: 'FP', appTechType: 'Application', isActive: true },
        { appTech: 'Injection Molding', shortText: 'IM', appTechType: 'Feature', isActive: true },
        { appTech: 'Blow Molding', shortText: 'BM', appTechType: 'Feature', isActive: true },
        { appTech: 'Extrusion', shortText: 'EX', appTechType: 'Application', isActive: true }
      ];

      // Combine all default entries
      const defaultEntries = [...defaultTechCat, ...defaultFeatureApp];

      try {
        // Create default entries in database
        await AppTech.insertMany(defaultEntries);

        // Fetch the newly created entries
        appTechs = await AppTech.find({}).sort({ appTech: 1 });

        console.log(`Created ${defaultEntries.length} default AppTech entries`);
      } catch (createError) {
        console.error('Error creating default AppTech entries:', createError);
        // Return mock data directly if database creation fails
        appTechs = defaultEntries.map(entry => ({
          _id: Math.random().toString(36).substring(2, 15),
          ...entry,
          toObject: () => entry
        }));
      }
    }

    // Process appTechs data to ensure proper format
    const processedAppTechs = appTechs.map(appTech => {
      const appTechObj = appTech.toObject();

      // Convert virtual 'commercialSamples' to regular field for the frontend if it exists
      if (appTech.commercialSamples && Array.isArray(appTech.commercialSamples)) {
        appTechObj.commercialSamples = appTech.commercialSamples.map(sample => ({
          id: sample._id,
          gradeName: sample.gradeName,
          application: sample.application,
          polymerType: sample.polymerType,
          isActive: sample.isActive
        }));
      } else {
        appTechObj.commercialSamples = [];
      }

      return appTechObj;
    });

    return NextResponse.json({ success: true, data: processedAppTechs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching app techs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch app techs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Create a new app tech
    const appTech = await AppTech.create(body);

    return NextResponse.json({ success: true, data: appTech }, { status: 201 });
  } catch (error) {
    console.error('Error creating app tech:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create app tech' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const dropAll = searchParams.get('dropAll') === 'true';
    
    if (dropAll) {
      // Delete all records
      const result = await AppTech.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} app techs` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting app techs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete app techs' },
      { status: 500 }
    );
  }
}
