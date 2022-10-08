const core = require('@actions/core');
const github = require('@actions/github');
const {
    findAllNestedPullRequestsIssues,
    lastPullRequests,
    updateProjectCardColumn,
    getIssueAssociedCards,
    addIssueToProjectColumn,
    getIssueProjectID
} = require('./queries')

exports.prWorkflow = async function () {
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const destBranch = github.context.payload.pull_request.base.ref;

    console.log("Destination branch: ", destBranch);

    const fieldID = core.getInput('fieldID');
    const optionID = core.getInput('optionID');

    if (github.context.payload.pull_request.base.merged === false) {
        return;
    }

    const lastPRs = await lastPullRequests(owner, repo, destBranch);
    if (!lastPRs[0]) {
        console.log(`Not found any PRs for ${destBranch}`);
        return;
    }
    if (!lastPRs[0].cursor) {
        console.log(`Not found cursor for PR!`);
        return;
    }

    let issues = [];
    for (let i = 0; i < lastPRs.length; i++) {
        const closingIssues = lastPRs[i].node.closingIssuesReferences.edges;

        for (let j = 0; j < closingIssues.length; j++) {
            issues.push(closingIssues[j].node);
        }
    }

    if (issues.length === 0) {
        console.log(`Not found any issues related to current PR and all children PRs`);
        return;
    }
    for (let i = 0; i < issues.length; i++) {
        let issue = issues[i];
        console.log("Name of issue to move: ", issue.title);

        const res = await getIssueProjectID(issue.id);
        const projectList = res.node.projectItems.nodes;

        // Iterate through every project linked to this issue
        for (let j = 0; j < projectList.length; j++) {
            const issueNodeID = projectList[j].id;
            const projectID = projectList[j].project.id;

            // Update columns in every project that contains this issue
            await updateProjectCardColumn(projectID, fieldID, issueNodeID, optionID);
        }

    }
}
