const core = require('@actions/core');
const github = require('@actions/github');
const graphqlApi = require('./graphql');
const { prWorkflow } = require('./pr-workflow');
const { issuesWorkflow } = require('./issues-workflow');
const { getRepositoryProjects, getOrganizationProjects, getUserProjects } = require('./queries')

async function run() {
    try {
        const githubToken = core.getInput('github_token');
        graphqlApi.init(githubToken);

        const { eventName } = github.context;
        if (eventName === 'pull_request') {
            prWorkflow();
        }

    } catch (e) {
        console.log(e);
        core.setFailed(e.message);
    }
}

run();

