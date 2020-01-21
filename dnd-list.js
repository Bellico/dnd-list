import { DndItems } from './dnd-items.js';
import { DndObserver } from './dnd-observer.js';

export class DndList {

    constructor(nodeParent) {
        this.dndItems = new DndItems();
        this.dndItems.initializeItems(nodeParent);

        const observer = new DndObserver(this.dndItems.addItem.bind(this.dndItems), this.dndItems.removeItem.bind(this.dndItems));
        observer.observe(nodeParent, { childList: true });
    }

    onDropped(callback) {
        this.dndItems.onDrop(callback);
    }
}
