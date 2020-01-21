export function applyDndList(node) {
  let items = [];
  let itemsPositions = [];

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(node => addItem(node));
      }

      if (mutation.removedNodes) {
        mutation.removedNodes.forEach(node => removeItem(node));
      }
    });
  });

  initializeItems(node.children);

  observer.observe(node, { childList: true });

  function initializeItems(nodeChildren) {
    items = Array.from(nodeChildren);

    itemsPositions = items.map((item, index) => {
      listenEventStart(item, index);

      return item.getBoundingClientRect();
    });
  }

  function addItem(child) {
    items.push(child);
    itemsPositions.push(child.getBoundingClientRect())
    const index = items.length - 1;
    listenEventStart(child, index);
  }

  function removeItem(child) {
    const index = items.indexOf(child);
    items.splice(index, 1);
    itemsPositions.splice(index, 1);
  }

  function listenEventStart(child, index) {
    child.addEventListener('mousedown', (event) => onStartDraggingHandler(event, index));
    child.addEventListener('touchstart', (event) => onStartDraggingHandler(event, index, true));
  }

  function refreshPositions() {
    itemsPositions = items.map(item => item.getBoundingClientRect());
  }

  window.addEventListener('resize', refreshPositions);
  window.addEventListener('scroll', refreshPositions);

  function onStartDraggingHandler(event, indexInDragging, isTouch = false) {
    event.preventDefault();
    event.stopPropagation();

    const origin = items[indexInDragging];
    const mousePosition = calculMousePosition(event);
    let indexOvered = -1;

    origin.addEventListener('mouseup', onStopDraggingHandler);
    origin.addEventListener('touchend', onStopDraggingHandler);

    document.addEventListener('mousemove', onDraggingHandler);
    document.addEventListener('touchmove', onDraggingHandler);

    function onDraggingHandler(event) {
      const { clientX, clientY } = !isTouch ? event : event.touches[0];

      origin.classList.add('is-dragging');

      translateOriginOnMove(clientX, clientY);

      indexOvered = findElementOvered(clientX, clientY);

      items.forEach((item, indexItem) => translateItem(item, { indexItem, indexOvered, indexInDragging }));
    }

    function onStopDraggingHandler(event) {
      document.removeEventListener('mousemove', onDraggingHandler);
      document.removeEventListener('touchmove', onDraggingHandler);

      origin.addEventListener("transitionend", onDraggingEndHandler);
      translateOriginToEnd();

      origin.removeEventListener('mouseup', onStopDraggingHandler);
      origin.removeEventListener('touchend', onStopDraggingHandler);
    }

    function onDraggingEndHandler(event) {
      origin.classList.remove('is-dragging');
      origin.removeEventListener("transitionend", onDraggingEndHandler);
      origin.style.transition = null;
      dropComplete();
      resetTransform();
    }

    function dropComplete() {
      if (isValidDrag()) {
        node.dispatchEvent(new CustomEvent(
          'dropped', {
          detail: {
            indexDragged: indexInDragging,
            indexDropped: indexOvered,
          }
        }));
      }
    }

    function isValidDrag() {
      return indexOvered !== -1 && indexOvered !== indexInDragging;
    }

    function resetTransform() {
      items.forEach((item) => {
        item.style.transition = null;
        item.style.transform = null;
      });
    }

    function calculMousePosition(event) {
      let { clientX, clientY } = event;

      if (isTouch) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      const offsetX = Math.ceil(clientX - itemsPositions[indexInDragging].left);
      const offsetY = Math.ceil(clientY - itemsPositions[indexInDragging].top);

      return { offsetX, offsetY };
    }

    function findElementOvered(clientX, clientY) {
      return itemsPositions.findIndex(pos => {
        return (clientX >= pos.left && clientX <= pos.left + pos.width) && (clientY >= pos.top && clientY <= pos.top + pos.height);
      });
    }

    function translateOriginToEnd() {
      const offsetX = isValidDrag() ? itemsPositions[indexOvered].left - itemsPositions[indexInDragging].left : 0;
      const offsetY = isValidDrag() ? itemsPositions[indexOvered].top - itemsPositions[indexInDragging].top : 0;

      origin.style.transition = 'transform 250ms';
      origin.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function translateOriginOnMove(clientX, clientY) {
      const offsetX = clientX - itemsPositions[indexInDragging].left - mousePosition.offsetX;
      const offsetY = clientY - itemsPositions[indexInDragging].top - mousePosition.offsetY;

      origin.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function translateItem(item, indexes) {
      const { indexItem, indexOvered, indexInDragging } = indexes;
      const { height } = itemsPositions[indexInDragging];

      if (indexItem === indexInDragging) {
        return;
      }

      item.style.transition = 'transform 250ms';

      if (indexOvered >= indexInDragging) {
        item.style.transform = shouldTranslateDown(indexes) ? `translate3d(0, -${height}px, 0)` : null;

      } else if (indexOvered < indexInDragging) {
        item.style.transform = shouldTranslateUp(indexes) ? `translate3d(0, ${height}px, 0)` : null;
      }
    }

    function shouldTranslateUp({ indexItem, indexOvered, indexInDragging }) {
      return isValidDrag() ? indexItem >= indexOvered && indexItem < indexInDragging : false;
    }

    function shouldTranslateDown({ indexItem, indexOvered, indexInDragging }) {
      return isValidDrag() ? indexItem <= indexOvered && indexItem > indexInDragging : false;
    }
  }

  return {
    onDropped: function (callbackdrop) {
      node.addEventListener('dropped', callbackdrop);

      return node;
    }
  };
}
