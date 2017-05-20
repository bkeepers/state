const yaml = require('js-yaml');

module.exports = robot => {
  robot.on('issues.labeled', check);
  robot.on('pull_request.labeled', check);

  async function check(event, context) {
    const config = await getConfig(context);
    const newLabel = event.payload.label.name;

    if (config.states.includes(newLabel)) {
      robot.log({label: newLabel}, 'State label added');
      const labels = (event.payload.issue || event.payload.pull_request).labels;

      labels.forEach(label => {
        if (config.states.includes(label.name) && label.name !== newLabel) {
          robot.log(label, 'Removing old state label');
          context.github.issues.removeLabel(context.issue({name: label.name}));
        }
      });
    }
  }

  async function getConfig(context) {
    const path = '.github/state.yml';
    const data = await context.github.repos.getContent(context.repo({path}));

    return yaml.load(Buffer.from(data.content, 'base64').toString()) || {};
  }
};
