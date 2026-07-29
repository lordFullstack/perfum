import { Loader2 } from "lucide-react";

import { useAuth } from "@/presentation/hooks/use-auth";
import { useUsers } from "@/presentation/features/users/use-users";
import { InviteUserDialog } from "@/presentation/features/users/invite-user-dialog";
import { Badge } from "@/presentation/components/ui/badge";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import { Switch } from "@/presentation/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
};

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UsersPage() {
  const { profile } = useAuth();
  const { users, roles, isLoading, mutatingUserId, inviteUser, toggleActive, changeRole } =
    useUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Usuarios</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrá quién tiene acceso a AromaPro y con qué rol.
          </p>
        </div>
        <InviteUserDialog roles={roles} onInvite={inviteUser} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Activo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === profile?.id;
                const isMutating = mutatingUserId === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-display text-xs text-secondary">
                          {getInitials(user.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.fullName}
                            {isSelf && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (vos)
                              </span>
                            )}
                          </p>
                          <p className="truncate font-data text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={user.roleId}
                        onValueChange={(newRoleId) => changeRole(user, newRoleId)}
                        disabled={isSelf || isMutating}
                      >
                        <SelectTrigger className="h-9 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {ROLE_LABELS[role.name] ?? role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "outline"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isMutating && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleActive(user)}
                          disabled={isSelf || isMutating}
                          aria-label={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
