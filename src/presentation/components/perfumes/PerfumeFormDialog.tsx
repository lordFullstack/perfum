import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import { Perfume, CreatePerfumeInput } from '../../../domain/entities/Perfume';
import { usePerfumes } from '../../../application/context/PerfumesContext';

interface PerfumeFormDialogProps {
  open: boolean;
  onClose: () => void;
  perfume?: Perfume | null;
}

const emptyForm: CreatePerfumeInput = {
  code: '',
  name: '',
  description: '',
  category: '',
  basePrice: 0,
  imageUrl: null,
};

export function PerfumeFormDialog({ open, onClose, perfume }: PerfumeFormDialogProps) {
  const { createPerfume, updatePerfume, uploadPerfumeImage } = usePerfumes();
  const [form, setForm] = useState<CreatePerfumeInput>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (perfume) {
      setForm({
        code: perfume.code,
        name: perfume.name,
        description: perfume.description ?? '',
        category: perfume.category ?? '',
        basePrice: perfume.basePrice,
        imageUrl: perfume.imageUrl,
      });
    } else {
      setForm(emptyForm);
    }
    setImageFile(null);
    setError(null);
  }, [perfume, open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (perfume) {
        const updated = await updatePerfume(perfume.id, form);
        if (imageFile) await uploadPerfumeImage(updated.id, imageFile);
      } else {
        const created = await createPerfume(form);
        if (imageFile) await uploadPerfumeImage(created.id, imageFile);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perfume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl font-medium">{perfume ? 'Editar perfume' : 'Nuevo perfume'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Código</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Categoría</label>
              <input
                value={form.category ?? ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Nombre</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Descripción</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Precio de venta</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: 'var(--color-gold)' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
