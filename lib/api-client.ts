"use client"

// Fetch capabilities from the API
export async function fetchCapabilities() {
  try {
    const response = await fetch('/api/capabilities');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response format');
    }
    
    // Transform the data into the format needed by the component
    return data.data.map((capability: any) => ({
      id: capability._id,
      name: capability.capabilityName,
      shortName: capability.shortName,
      description: capability.capabilityDesc || `Analysis using ${capability.capabilityName} techniques`,
    }));
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    return [];
  }
}
