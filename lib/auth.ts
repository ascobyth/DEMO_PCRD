// Authentication utilities and functions

// User roles
export type UserRole = "user" | "admin" | "lab_manager"

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
}

export interface Permission {
  admin: boolean
  lab_manager: boolean
  user: boolean
}

// Function to check if a user exists in the database
export async function checkUserExists(email: string): Promise<User | null> {
  try {
    // Fetch user data from the database API
    const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
    
    if (!response.ok) {
      console.error('Failed to fetch user:', response.statusText)
      return null
    }
    
    const data = await response.json()
    
    if (data.success && data.user) {
      const dbUser = data.user
      
      // Map database role to simplified role
      const roleMapping: { [key: string]: UserRole } = {
        'SuperAdmin': 'admin',
        'Admin': 'admin',
        'ATCManager': 'lab_manager',
        'RequesterManager': 'lab_manager',
        'Requester': 'user',
        'EngineerResearcher': 'user',
        'SeniorEngineerSeniorResearcher': 'user',
        'Technician': 'lab_manager',
        'TechnicianAssistant': 'lab_manager'
      }
      
      return {
        id: dbUser._id || dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: roleMapping[dbUser.role] || 'user',
        department: dbUser.department || dbUser.division || 'Unknown Department',
      }
    }
    
    return null
  } catch (error) {
    console.error('Error checking user existence:', error)
    
    // Fallback for admin@admin.com if database is not available
    if (email === "admin@admin.com") {
      return {
        id: "admin-123",
        name: "Admin User",
        email: "admin@admin.com",
        role: "admin",
        department: "System Administration",
      }
    }
    
    return null
  }
}

// Mock function to check if a user has a specific permission
export function hasPermission(user: User, permission: keyof Permission): boolean {
  // This is a placeholder - replace with your actual permission logic
  if (user.role === "admin") return true // Admins have all permissions

  // Define a mapping of roles to permissions
  const rolePermissions: { [key in UserRole]: (keyof Permission)[] } = {
    user: ["user"],
    admin: ["admin", "user", "lab_manager"],
    lab_manager: ["lab_manager", "user"],
  }

  return rolePermissions[user.role].includes(permission)
}

