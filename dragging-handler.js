export class DraggingHandler {

    //#region Constructor
    constructor(context) {
        this.context = context;

        context.eventStart.preventDefault();
        context.eventStart.stopPropagation();

        this.mousePosition = this.calculMousePosition();
        this.indexOvered = -1;

        this.$onStopDraggingHandler = this.onStopDraggingHandler.bind(this);
        this.origin.addEventListener('mouseup', this.$onStopDraggingHandler);
        this.origin.addEventListener('touchend', this.$onStopDraggingHandler);

        this.$onDraggingHandler = this.onDraggingHandler.bind(this);
        document.addEventListener('mousemove', this.$onDraggingHandler);
        document.addEventListener('touchmove', this.$onDraggingHandler);
    }
    //#endregion

    //#region Getters
    get eventStart() {
        return this.context.eventStart;
    }

    get isTouch() {
        return this.context.isTouch;
    }

    get indexDragging() {
        return this.context.indexDragging;
    }

    get items() {
        return this.context.items;
    }

    get itemsPositions() {
        return this.context.itemsPositions;
    }

    get origin() {
        return this.items[this.indexDragging];
    }

    get originPosition() {
        return this.itemsPositions[this.indexDragging];
    }

    get overedPosition() {
        return this.itemsPositions[this.indexOvered];
    }
    //#endregion

    //#region Dragging Handler
    onDraggingHandler(event) {
        const { clientX, clientY } = !this.isTouch ? event : event.touches[0];

        this.origin.classList.add('is-dragging');

        this.translateOriginOnMove(clientX, clientY);

        this.indexOvered = this.findElementOvered(clientX, clientY);

        this.items.forEach((item, index) => this.translateItem(item, index));
    }

    translateOriginOnMove(clientX, clientY) {
        const offsetX = clientX - this.originPosition.left - this.mousePosition.offsetX;
        const offsetY = clientY - this.originPosition.top - this.mousePosition.offsetY;

        this.origin.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    findElementOvered(clientX, clientY) {
        return this.itemsPositions.findIndex(pos => {
            return (clientX >= pos.left && clientX <= pos.left + pos.width) && (clientY >= pos.top && clientY <= pos.top + pos.height);
        });
    }
    //#endregion

    //#region Stop Dragging Handler
    onStopDraggingHandler(event) {
        document.removeEventListener('mousemove', this.$onDraggingHandler);
        document.removeEventListener('touchmove', this.$onDraggingHandler);

        this.$onDraggingEndHandler = this.onDraggingEndHandler.bind(this);
        this.origin.addEventListener("transitionend", this.$onDraggingEndHandler);
        this.translateOriginToEnd();

        this.origin.removeEventListener('mouseup', this.$onStopDraggingHandler);
        this.origin.removeEventListener('touchend', this.$onStopDraggingHandler);
    }

    translateOriginToEnd() {
        const offsetX = this.isValidDrag() ? this.overedPosition.left - this.originPosition.left : 0;
        const offsetY = this.isValidDrag() ? this.overedPosition.top - this.originPosition.top : 0;

        this.origin.style.transition = 'transform 250ms';
        this.origin.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    onDraggingEndHandler(event) {
        this.origin.classList.remove('is-dragging');
        this.origin.removeEventListener("transitionend", this.$onDraggingEndHandler);
        this.origin.style.transition = null;
        this.dropComplete();
        this.resetTransform();
    }

    dropComplete() {
        if (this.fnOnDnd && this.isValidDrag()) {
            this.fnOnDnd({
                indexDragged: this.indexDragging,
                indexDropped: this.indexOvered,
            });
        }
    }
    //#endregion

    //#region Helpers
    listenDrop(fn) {
        this.fnOnDnd = fn;
    }

    isValidDrag() {
        return this.indexOvered !== -1 && this.indexOvered !== this.indexDragging;
    }

    resetTransform() {
        this.items.forEach((item) => {
            item.style.transition = null;
            item.style.transform = null;
        });
    }

    translateItem(item, indexItem) {
        if (indexItem === this.indexDragging) {
            return;
        }

        if (!this.isValidDrag()) {
            item.style.transform = null;
            return;
        }

        const { height } = this.originPosition;
        item.style.transition = 'transform 250ms';

        if (this.shouldTranslateDown(indexItem)) {
            item.style.transform = `translate3d(0, -${height}px, 0)`;
        }
        else if (this.shouldTranslateUp(indexItem)) {
            item.style.transform = `translate3d(0, ${height}px, 0)`;
        }
        else {
            item.style.transform = null;
        }
    }

    shouldTranslateUp(indexItem) {
        return indexItem >= this.indexOvered && indexItem < this.indexDragging;
    }

    shouldTranslateDown(indexItem) {
        return indexItem <= this.indexOvered && indexItem > this.indexDragging;
    }

    calculMousePosition() {
        let { clientX, clientY } = this.eventStart;

        if (this.isTouch) {
            clientX = this.eventStart.touches[0].clientX;
            clientY = this.eventStart.touches[0].clientY;
        }

        const offsetX = Math.ceil(clientX - this.originPosition.left);
        const offsetY = Math.ceil(clientY - this.originPosition.top);

        return { offsetX, offsetY };
    }
    //#endregion
}
