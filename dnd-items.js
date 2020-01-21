import { DraggingHandler } from './dragging-handler.js';

export class DndItems {

  constructor() {
    this.items = [];
    this.itemsPositions = [];

    window.addEventListener('resize', () => this.refreshPositions());
    window.addEventListener('scroll', () => this.refreshPositions());
  }

  initializeItems(nodeParent) {
    this.items = Array.from(nodeParent.children);

    this.itemsPositions = this.items.map((item, index) => {
      this.listenEventStart(item, index);

      return item.getBoundingClientRect();
    });
  }

  listenEventStart(item, index) {
    item.addEventListener('mousedown', (event) => new DraggingHandler(this.buildContextDragging(event, index)).listenDrop(this.onDropfn));
    item.addEventListener('touchstart', (event) => new DraggingHandler(this.buildContextDragging(event, index, true)).listenDrop(this.onDropfn));
  }

  onDrop(fn) {
    this.onDropfn = fn;
  }

  buildContextDragging(event, index, isTouch = false) {
    return {
      eventStart: event,
      items: this.items,
      itemsPositions: this.itemsPositions,
      indexDragging: index,
      isTouch
    }
  }

  addItem(child) {
    this.items.push(child);
    this.itemsPositions.push(child.getBoundingClientRect())
    const index = this.items.length - 1;
    this.listenEventStart(child, index);
  }

  removeItem(child) {
    const index = this.items.indexOf(child);
    this.items.splice(index, 1);
    this.itemsPositions.splice(index, 1);
  }

  refreshPositions() {
    this.itemsPositions = this.items.map(item => item.getBoundingClientRect());
  }

}
