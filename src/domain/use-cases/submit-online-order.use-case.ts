import type { CatalogRepository, SubmitOnlineOrderInput } from "@/domain/repositories/catalog.repository";
import type { OnlineOrder } from "@/domain/entities/online-order.entity";

export class InvalidOnlineOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOnlineOrderError";
  }
}

function validate(input: SubmitOnlineOrderInput): void {
  if (input.customerName.trim().length < 2) {
    throw new InvalidOnlineOrderError("Ingresá tu nombre completo.");
  }
  if (input.customerPhone.trim().length < 6) {
    throw new InvalidOnlineOrderError("Ingresá un teléfono de contacto válido.");
  }
  if (input.items.length === 0) {
    throw new InvalidOnlineOrderError("Agregá al menos un perfume al pedido.");
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new InvalidOnlineOrderError("La cantidad de cada perfume debe ser un entero mayor a cero.");
    }
  }
}

export async function submitOnlineOrderUseCase(
  repository: CatalogRepository,
  input: SubmitOnlineOrderInput,
): Promise<OnlineOrder> {
  validate(input);
  return repository.submitOrder(input);
}
