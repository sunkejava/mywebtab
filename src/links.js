export function removeLinksByIds(links, selectedIds) {
  const ids = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
  return ids.size ? links.filter(link => !ids.has(link.id)) : links;
}

export function pruneUnusedCategories(categories, links) {
  const used = new Set(links.map(link => link.category));
  return (categories || []).filter(category => used.has(category.id));
}
