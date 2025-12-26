const { CompositeDisposable } = require("atom");
const CommandList = require("./list");

let view;
let disposables;

module.exports = {
  activate() {
    view = new CommandList();
    disposables = new CompositeDisposable();
    disposables.add(
      atom.commands.add("atom-workspace", {
        "command-palette:toggle": () => view.toggle(),
        "command-palette:show-hidden-commands": () => view.show(true),
      })
    );
  },

  async deactivate() {
    disposables.dispose();
    await view.destroy();
  },
};
