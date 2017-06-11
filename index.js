const yaml = require('js-yaml');

module.exports = robot => {
  robot.on('issues.labeled', check);
  robot.on('pull_request.labeled', check);

  async function check(event, context) {
    const config = await getConfig(context);
    const newLabel = event.payload.label.name;

    if (config.states.includes(newLabel)) {
      robot.log({label: newLabel}, 'State label added');
      const issue = event.payload.issue || event.payload.pull_request;

      issue.labels.forEach(label => {
        if (config.states.includes(label.name) && label.name !== newLabel) {
          robot.log(label, 'Removing old state label');
          context.github.issues.removeLabel(context.issue({name: label.name}));
        }
      });

      // Close your eyes. This is all horrible and needs refactored…later
      if (config.project) {
        robot.log('Updating project', config.project);
        const projects = await context.github.projects.getRepoProjects(context.repo());
        const project = projects.data.find(project => project.name === config.project);

        if (project) {
          const columns = await context.github.projects.getProjectColumns({project_id: project.id});
          const column = columns.data.find(column => column.name === newLabel);

          if (column) {
            try {
              await context.github.projects.createProjectCard({
                column_id: column.id,
                content_id: issue.id,
                content_type: event.payload.issue ? 'Issue' : 'PullRequest'
              });
            } catch (err) {
              robot.log.error({err}, 'Card is already on project. Finding it…');

              let existingCard;

              for (const column of columns) {
                /* eslint-disable no-await-in-loop */
                const cards = await context.github.projects.getProjectCards({column_id: column.id});
                existingCard = cards.data.find(card => card.content_url === issue.url);
                if (existingCard) {
                  break;
                }
              }

              await context.github.projects.moveProjectCard({
                column_id: column.id,
                id: existingCard.id,
                position: 'top'
              });
            }
          }
        }
      }
    }
  }

  async function getConfig(context) {
    const path = '.github/state.yml';
    const res = await context.github.repos.getContent(context.repo({path}));

    return yaml.load(Buffer.from(res.data.content, 'base64').toString()) || {};
  }
};
