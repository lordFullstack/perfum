import { LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/presentation/hooks/use-auth";
import { ThemeToggle } from "@/presentation/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";

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

export function Topbar({ title }: { title: string }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
      <h1 className="font-display text-lg text-foreground">{title}</h1>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-elegant hover:bg-accent"
              aria-label="Menú de usuario"
            >
              <Avatar className="size-8">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>
                  {profile ? getInitials(profile.fullName) : <UserIcon className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-foreground sm:inline">
                {profile?.fullName.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate font-medium">{profile?.fullName}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {profile ? ROLE_LABELS[profile.role] : ""}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
