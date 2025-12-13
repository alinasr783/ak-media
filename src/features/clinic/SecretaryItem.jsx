import { useState } from "react";
import { Button } from "../../components/ui/button";
import SecretaryPermissionsDialog from "./SecretaryPermissionsDialog";
import { Edit, User } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { SECRETARY_PERMISSIONS } from "./clinicUtils";

export default function SecretaryItem({ secretary, onUpdatePermissions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState(() => {
    // Initialize with default permissions if none exist
    let permissions = [];
    
    // Handle string permissions (JSON string from database)
    if (typeof secretary.permissions === 'string') {
      try {
        permissions = JSON.parse(secretary.permissions);
      } catch (e) {
        console.warn("Failed to parse permissions:", e);
        permissions = [];
      }
    } else if (Array.isArray(secretary.permissions)) {
      permissions = secretary.permissions;
    }

    if (permissions.length > 0) {
      return permissions;
    }
    // Default permissions for new secretaries
    return ["dashboard", "calendar", "patients"];
  });

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) => {
      const currentPermissions = Array.isArray(prev) ? prev : [];

      if (currentPermissions.includes(permissionId)) {
        return currentPermissions.filter((p) => p !== permissionId);
      } else {
        return [...currentPermissions, permissionId];
      }
    });
  };

  const handleSavePermissions = () => {
    onUpdatePermissions(secretary.user_id, selectedPermissions);
    setIsOpen(false);
  };

  // Get permission labels for display
  const getPermissionLabels = () => {
    let permissions = [];
    
    // Handle string permissions (JSON string from database)
    if (typeof secretary.permissions === 'string') {
      try {
        permissions = JSON.parse(secretary.permissions);
      } catch (e) {
        console.warn("Failed to parse permissions:", e);
        permissions = [];
      }
    } else if (Array.isArray(secretary.permissions)) {
      permissions = secretary.permissions;
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return ["لا توجد صلاحيات"];
    }
    
    return permissions.map(perm => {
      // Handle both string and object permissions
      const permId = typeof perm === 'object' && perm !== null ? perm.id : perm;
      // Ensure it's a string
      const permString = String(permId).trim();
      
      const permission = SECRETARY_PERMISSIONS.find(p => p.id === permString);
      return permission ? permission.label : permString;
    });
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{secretary.name}</div>
            <div className="text-sm text-muted-foreground">{secretary.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
            {getPermissionLabels().slice(0, 3).map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {getPermissionLabels().length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{getPermissionLabels().length - 3}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <Edit className="ml-1 h-4 w-4" />
            الصلاحيات
          </Button>
        </div>
      </div>

      <SecretaryPermissionsDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        secretary={secretary}
        selectedPermissions={selectedPermissions}
        onPermissionChange={handlePermissionChange}
        onSave={handleSavePermissions}
      />
    </>
  );
}