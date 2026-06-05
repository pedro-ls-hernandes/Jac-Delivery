export function getDeliveryDate(entrega) {
  return new Date(entrega.data_criacao || entrega.createdAt || entrega.updatedAt || Date.now());
}

export function isTodayDelivery(entrega) {
  const today = new Date();
  const date = getDeliveryDate(entrega);

  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

export function sortDeliveriesByDayOrder(entregas) {
  return [...entregas].sort((first, second) => {
    const firstOrder = Number(first.ordem || 0);
    const secondOrder = Number(second.ordem || 0);

    if (firstOrder && secondOrder && firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return getDeliveryDate(first) - getDeliveryDate(second);
  });
}
