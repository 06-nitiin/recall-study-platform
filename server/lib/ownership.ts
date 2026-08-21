export function isOwnedByUser(ownerId: number, userId: number) {
  return ownerId === userId;
}
