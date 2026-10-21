export function applyStock(products, updates) {
  const next = new Map(
    (updates || []).map((item) => [String(item.id), item.stock])
  );
  return (products || []).map((product) =>
    next.has(String(product.id))
      ? { ...product, stock: next.get(String(product.id)) }
      : product
  );
}
