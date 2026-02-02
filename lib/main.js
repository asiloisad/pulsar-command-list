const { CompositeDisposable } = require("atom");
const CommandList = require("./list");

module.exports = {

  activate(state) {
    this.list = new CommandList(state?.recentlyUsed);
    this.disposables = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "command-list:toggle": () => this.list.toggle(),
        "command-list:show-hidden-commands": () => this.list.show(true),
      })
    );
  },

  serialize() {
    return { recentlyUsed: this.list.recentlyUsed };
  },

  async deactivate() {
    this.disposables.dispose();
    await this.list.destroy();
  },
};
