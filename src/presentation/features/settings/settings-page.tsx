import { useEffect, useState, type FormEvent } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

import { useSettings } from "@/presentation/features/settings/use-settings";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Switch } from "@/presentation/components/ui/switch";
import { Separator } from "@/presentation/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

export function SettingsPage() {
  const { branch, business, ai, wompi, isLoading, updateBranch, updateBusiness, updateAi, updateWompi } =
    useSettings();

  // Sucursal
  const [branchName, setBranchName] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [isSavingBranch, setIsSavingBranch] = useState(false);

  // Negocio
  const [currency, setCurrency] = useState("COP");
  const [taxRate, setTaxRate] = useState("0");
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // IA
  const [aiProvider, setAiProvider] = useState("openai");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);

  // Wompi
  const [wompiPublicKey, setWompiPublicKey] = useState("");
  const [wompiSecret, setWompiSecret] = useState("");
  const [wompiEnabled, setWompiEnabled] = useState(false);
  const [isSavingWompi, setIsSavingWompi] = useState(false);

  useEffect(() => {
    if (branch) {
      setBranchName(branch.name);
      setBranchPhone(branch.phone ?? "");
      setBranchAddress(branch.address ?? "");
    }
  }, [branch]);

  useEffect(() => {
    if (business) {
      setCurrency(business.currency);
      setTaxRate(String(business.taxRate));
    }
  }, [business]);

  useEffect(() => {
    if (ai) {
      setAiProvider(ai.provider ?? "openai");
      setAiEnabled(ai.isEnabled);
    }
  }, [ai]);

  useEffect(() => {
    if (wompi) {
      setWompiPublicKey(wompi.publicKey ?? "");
      setWompiEnabled(wompi.isEnabled);
    }
  }, [wompi]);

  async function handleBranchSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingBranch(true);
    await updateBranch({
      name: branchName,
      phone: branchPhone.trim() || null,
      address: branchAddress.trim() || null,
    });
    setIsSavingBranch(false);
  }

  async function handleBusinessSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingBusiness(true);
    await updateBusiness({ currency, taxRate: Number(taxRate) || 0 });
    setIsSavingBusiness(false);
  }

  async function handleAiSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingAi(true);
    const success = await updateAi({
      provider: aiProvider,
      apiKey: aiApiKey.trim() || null,
      isEnabled: aiEnabled,
    });
    if (success) setAiApiKey("");
    setIsSavingAi(false);
  }

  async function handleWompiSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingWompi(true);
    const success = await updateWompi({
      publicKey: wompiPublicKey,
      integritySecret: wompiSecret.trim() || null,
      isEnabled: wompiEnabled,
    });
    if (success) setWompiSecret("");
    setIsSavingWompi(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Configuración</h2>
        <p className="mt-1 text-sm text-muted-foreground">Datos de la sucursal y parámetros del negocio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sucursal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBranchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="branchName">Nombre</Label>
              <Input
                id="branchName"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                disabled={isSavingBranch}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="branchPhone">Teléfono</Label>
                <Input
                  id="branchPhone"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  disabled={isSavingBranch}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="branchAddress">Dirección</Label>
                <Input
                  id="branchAddress"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  disabled={isSavingBranch}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSavingBranch} className="self-start">
              {isSavingBranch && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parámetros del negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBusinessSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input
                  id="currency"
                  className="font-data"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  disabled={isSavingBusiness}
                  maxLength={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="taxRate">IVA (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className="font-data"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  disabled={isSavingBusiness}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSavingBusiness} className="self-start">
              {isSavingBusiness && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integración de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAiSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Infraestructura lista para conectar un proveedor de IA más adelante. Todavía no hay
              ninguna función que use esta clave.
            </p>
            <div className="flex flex-col gap-2">
              <Label>Proveedor</Label>
              <Select value={aiProvider} onValueChange={setAiProvider} disabled={isSavingAi}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="aiApiKey">
                API key {ai?.hasApiKey && <span className="text-muted-foreground">(ya hay una guardada)</span>}
              </Label>
              <Input
                id="aiApiKey"
                type="password"
                placeholder={ai?.hasApiKey ? "••••••••••••" : "Pegá tu API key"}
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                disabled={isSavingAi}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} disabled={isSavingAi} />
              <Label>Activada</Label>
            </div>
            <Button type="submit" variant="outline" disabled={isSavingAi} className="self-start">
              {isSavingAi && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagos online (Wompi)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWompiSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <ShieldAlert className="size-4 shrink-0 translate-y-0.5" />
              <p>
                Scaffolding sin activar todavía. El checkout con pago real en el catálogo no aparece
                hasta que cargues acá las llaves reales de tu cuenta Wompi.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wompiPublicKey">Public key</Label>
              <Input
                id="wompiPublicKey"
                className="font-data"
                placeholder="pub_test_..."
                value={wompiPublicKey}
                onChange={(e) => setWompiPublicKey(e.target.value)}
                disabled={isSavingWompi}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wompiSecret">
                Integrity secret{" "}
                {wompi?.hasIntegritySecret && <span className="text-muted-foreground">(ya hay una guardada)</span>}
              </Label>
              <Input
                id="wompiSecret"
                type="password"
                placeholder={wompi?.hasIntegritySecret ? "••••••••••••" : "Secreto de integridad"}
                value={wompiSecret}
                onChange={(e) => setWompiSecret(e.target.value)}
                disabled={isSavingWompi}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={wompiEnabled} onCheckedChange={setWompiEnabled} disabled={isSavingWompi} />
              <Label>Activado</Label>
            </div>
            <Button type="submit" variant="outline" disabled={isSavingWompi} className="self-start">
              {isSavingWompi && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />
    </div>
  );
}
