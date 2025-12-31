const { CompositeDisposable } = require("atom");
const CommandList = require("./list");

module.exports = {

  activate() {
    this.list = new CommandList();
    this.disposables = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "command-list:toggle": () => this.list.toggle(),
        "command-list:show-hidden-commands": () => this.list.show(true),
      })
    );
  },

  async deactivate() {
    this.disposables.dispose();
    await this.list.destroy();
  },
};
