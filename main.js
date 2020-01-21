
import { DndList } from './dndclass.js';
import { renderItem } from './render-item.js';
import { sortItemsOnDrop } from './helper.js';

let items = ['Salut', 'Hello', 'Ola', 'Guttentag', 'Hey', 'Yop', 'Hi', 'Bonjourno'];
const listing = document.querySelector('.listing');

function onDropped(eventDrop) {
    items = sortItemsOnDrop(items, eventDrop);
    renderItem(listing, items);
}

new DndList(listing).onDropped(onDropped);

renderItem(listing, items);

document.querySelector('#add').addEventListener('click', () => {
    const id = Date.now().toString(36).toUpperCase();
    const itemChild = document.createElement('div');
    itemChild.classList.add('item');
    const h1 = document.createElement('h1');
    h1.innerHTML = id;

    items.push(id);
    itemChild.appendChild(h1);
    listing.appendChild(itemChild);
});

