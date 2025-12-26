const { CompositeDisposable } = require("atom");
const CommandList = require("./list");

module.exports = {

  activate() {
    this.list = new CommandList();
    this.disposables = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "command-palette:toggle": () => this.list.toggle(),
        "command-palette:show-hidden-commands": () => this.list.show(true),
      })
    );
  },

  async deactivate() {
    this.disposables.dispose();
    await this.list.destroy();
  },
};
