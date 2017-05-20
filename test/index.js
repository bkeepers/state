const expect = require('expect');
const plugin = require('..');

const config = {
  content: Buffer.from(`
    states:
      - in-progress
      - in-review
      - accepted
  `).toString('base64')
};

class TestRobot {
  constructor(github) {
    this.handlers = {};
    this.github = github;
  }

  on(name, callback) {
    this.handlers[name] = this.handlers[name] || [];
    this.handlers[name].push(callback);
  }

  emit(name, event) {
    const handlers = this.handlers[name] || [];
    const context = {
      event,
      github: this.github,
      issue: args => args,
      repo: args => args
    };

    return Promise.all(handlers.map(handler => handler(event, context)));
  }

  log() {
  }
}

describe('state', () => {
  let robot;
  let github;
  let event;

  beforeEach(() => {
    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve(config))
      },
      issues: {
        removeLabel: expect.createSpy()
      }
    };

    robot = new TestRobot(github);
    plugin(robot);
  });

  describe('adding issue label', () => {
    beforeEach(() => {
      event = {
        payload: require('./fixtures/issues.labeled')
      };
    });

    it('removes other state labels', async () => {
      await robot.emit('issues.labeled', event);

      expect(github.issues.removeLabel.calls.length).toBe(1);
      expect(github.issues.removeLabel).toHaveBeenCalledWith({
        name: 'in-review'
      });
    });
  });
});
