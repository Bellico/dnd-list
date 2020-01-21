export function sortItemsOnDrop(items, { indexDragged, indexDropped }) {
    const dragged = items[indexDragged];
    items.splice(indexDragged, 1);

    const deb = items.slice(0, indexDropped);
    const end = items.slice(indexDropped, items.length);

    return [...deb, dragged, ...end];
}
