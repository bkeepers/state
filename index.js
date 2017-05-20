const states = [
  `in-progress`,
  `in-review`,
  `withdrawn`,
  `deferred`,
  `accepted`,
  `rejected`,
  `implemented`
];

module.exports = robot => {
  robot.on('issues.labeled', check);
  robot.on('pull_request.labeled', check);

  function check(event, context) {
    const newLabel = event.payload.label.name;

    if (states.includes(newLabel)) {
      robot.log({label: newLabel}, 'State label added');
      const labels = (event.payload.issue || event.payload.pull_request).labels;

      labels.forEach(label => {
        if (states.includes(label.name) && label.name !== newLabel) {
          robot.log(label, 'Removing old state label');
          context.github.issues.removeLabel(context.issue({name: label.name}));
        }
      });
    }
  }
};
