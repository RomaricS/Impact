// Shared team ordering used by both the public site and the admin dashboard.
//
// Teams are sorted by their numeric `order` field. Teams without one fall back
// to alphabetical-by-name, which preserves the original 12→14→16 Blue→16 Pink→
// 17→18 ordering, so no data migration is required — admins assign `order` as
// they edit.

export function sortTeams(teams) {
  return Object.values(teams).sort(
    (a, b) =>
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      (a.name || '').localeCompare(b.name || '')
  );
}

// The `order` value a newly added team should get: one past the current max.
export function nextOrder(teams) {
  const orders = Object.values(teams)
    .map(t => t.order)
    .filter(o => typeof o === 'number');
  return orders.length ? Math.max(...orders) + 1 : 1;
}
