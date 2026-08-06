import { useState, type FormEvent } from "react";
import { Copy, Loader2, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";

import type { RoleOption } from "@/domain/entities/managed-user.entity";
import type { InviteUserInput } from "@/domain/repositories/user-management.repository";
import { generateTemporaryPassword } from "@/shared/utils/generate-password";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
};

interface InviteUserDialogProps {
  roles: RoleOption[];
  onInvite: (input: InviteUserInput) => Promise<boolean>;
}

export function InviteUserDialog({ roles, onInvite }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [temporaryPassword, setTemporaryPassword] = useState(() => generateTemporaryPassword());

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setRoleId("");
    setTemporaryPassword(generateTemporaryPassword());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onInvite({
      fullName,
      email,
      phone: phone || null,
      roleId,
      temporaryPassword,
    });

    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      resetForm();
    }
  }

  function copyPassword() {
    navigator.clipboard.writeText(temporaryPassword);
    toast.success("Contraseña copiada al portapapeles.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Nuevo usuario
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Se crea con la contraseña temporal de abajo. Compartísela al usuario por un canal
            seguro — puede cambiarla luego desde "¿Olvidaste tu contraseña?" en el login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Rol</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {ROLE_LABELS[role.name] ?? role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tempPassword">Contraseña temporal</Label>
            <div className="flex gap-2">
              <Input id="tempPassword" readOnly value={temporaryPassword} className="font-data" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Generar otra contraseña"
                onClick={() => setTemporaryPassword(generateTemporaryPassword())}
                disabled={isSubmitting}
              >
                <RefreshCw />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copiar contraseña"
                onClick={copyPassword}
                disabled={isSubmitting}
              >
                <Copy />
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting || !roleId}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Creando…" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
