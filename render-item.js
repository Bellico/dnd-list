export function renderItem(node, items) {
  node.innerHTML = null;
  items.forEach((item) => {
    const itemChild = document.createElement('div');
    itemChild.classList.add('item');
    const h1 = document.createElement('h1');
    h1.innerHTML = item;

    itemChild.appendChild(h1);
    node.appendChild(itemChild);
  });
}
