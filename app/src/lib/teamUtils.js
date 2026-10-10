export const POSITIONS = ['OPP', 'S', 'MB', 'DS', 'L', 'OH'];

export function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
