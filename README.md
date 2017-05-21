# Probot: State

> a GitHub Integration built with [probot](https://github.com/probot/probot) that defines a state machine for GitHub Issues and Pull Requests

## Usage

1. **[Configure the GitHub Integration](https://github.com/integration/state)**
2. Create `.github/state.yml`

A `.github/state.yml` file is required to enable the plugin, and it must list the labels that are considered unique states:

```yml
states:
- bug
- enhancement
- question

# Name of project to update when state changes.
# This add Issues and Pull Requests to columns with the same name as the states.
project: Backlog
```

Whenever one of these labels are added to an Issue or Pull Request, it will remove labels for any of the other states.

## Development

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
