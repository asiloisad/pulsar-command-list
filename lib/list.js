const { SelectListView, highlightMatches } = require("pulsar-select-list");

class CommandList {
  constructor() {
    this.keyBindingsForActiveElement = [];
    this.showHiddenCommands = false;

    this.selectListView = new SelectListView({
      items: [],
      className: "command-palette",
      emptyMessage: "No matches found",

      filterKeyForItem: (item) => {
        let key = item.displayName;
        if (item.tags) {
          key += " " + item.tags.join(" ");
        }
        if (item.description) {
          key += " " + item.description;
        }
        return key;
      },

      willShow: () => {
        this.activeElement =
          document.activeElement === document.body
            ? atom.views.getView(atom.workspace)
            : document.activeElement;
        this.keyBindingsForActiveElement = atom.keymaps.findKeyBindings({
          target: this.activeElement,
        });
        const commands = atom.commands
          .findCommands({ target: this.activeElement })
          .filter(
            (command) =>
              this.showHiddenCommands === !!command.hiddenInCommandPalette
          );
        commands.sort((a, b) => a.displayName.localeCompare(b.displayName));
        this.selectListView.update({ items: commands });
      },

      elementForItem: (item, { selected, matchIndices }) => {
        const li = document.createElement("li");
        li.classList.add("event", "two-lines");
        li.dataset.eventName = item.name;

        // Key bindings on the right
        const rightBlock = document.createElement("div");
        rightBlock.classList.add("pull-right");
        const seen = new Set();
        this.keyBindingsForActiveElement
          .filter(({ command, keystrokes }) => {
            if (command !== item.name || seen.has(keystrokes)) return false;
            seen.add(keystrokes);
            return true;
          })
          .forEach((keyBinding) => {
            const kbd = document.createElement("kbd");
            kbd.classList.add("key-binding");
            kbd.textContent = humanizeKeystroke(keyBinding.keystrokes);
            rightBlock.appendChild(kbd);
          });
        li.appendChild(rightBlock);

        // Primary line: command name
        const leftBlock = document.createElement("div");
        const titleEl = document.createElement("div");
        titleEl.classList.add("primary-line");
        titleEl.title = item.name;
        titleEl.appendChild(highlightMatches(item.displayName, matchIndices));
        leftBlock.appendChild(titleEl);

        // Secondary line: description
        if (item.description) {
          const secondaryEl = document.createElement("div");
          secondaryEl.classList.add("secondary-line");
          secondaryEl.title = item.description;
          const offset =
            item.displayName.length +
            (item.tags ? item.tags.join(" ").length + 1 : 0) +
            1;
          secondaryEl.appendChild(
            highlightMatches(
              item.description,
              matchIndices.map((i) => i - offset)
            )
          );
          leftBlock.appendChild(secondaryEl);
        }

        li.appendChild(leftBlock);
        return li;
      },

      didConfirmSelection: (item) => {
        this.selectListView.hide();
        const event = new CustomEvent(item.name, {
          bubbles: true,
          cancelable: true,
        });
        this.activeElement.dispatchEvent(event);
      },

      didCancelSelection: () => {
        this.selectListView.hide();
      },
    });
  }

  destroy() {
    return this.selectListView.destroy();
  }

  toggle() {
    this.showHiddenCommands = false;
    return this.selectListView.toggle();
  }

  show(showHiddenCommands = false) {
    this.showHiddenCommands = showHiddenCommands;
    return this.selectListView.show();
  }

  hide() {
    return this.selectListView.hide();
  }
}

function humanizeKeystroke(keystroke) {
  return keystroke
    .split(" ")
    .map((combo) =>
      combo
        .split("-")
        .filter((k) => k)
        .map((k) => k[0].toUpperCase() + k.slice(1))
        .join("+")
    )
    .join(" ");
}

module.exports = CommandList;
