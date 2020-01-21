export class DndObserver extends MutationObserver {

  constructor(addItem, removeItem) {

    const onMutation = (mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => addItem(node));
        }

        if (mutation.removedNodes) {
          mutation.removedNodes.forEach(node => removeItem(node));
        }
      });
    }

    super(onMutation);
  }
}
