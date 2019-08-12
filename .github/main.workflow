workflow "publish on release" {
  on = "push"
  resolves = ["publish"]
}

action "publish" {
  uses = "zackify/npm@354aa07"
  args = "cd vue && cd sbc-common-components && npm publish"
  secrets = ["NPM_AUTH_TOKEN"]
}
