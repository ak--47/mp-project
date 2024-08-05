
const MixpanelProject = require('../index.js');
const { execSync } = require('child_process');
require('dotenv').config();
beforeAll(() => { execSync(`npm run prune`); });
afterAll(() => { execSync(`npm run prune`); });
jest.setTimeout(60000);

const {
	access_token,
	service_acct,
	service_secret,
	id,
} = process.env;

if (!access_token || !service_acct || !service_secret || !id) {
	throw new Error('Please set the following environment variables: access_token, service_acct, service_secret, id');
}

const project = new MixpanelProject({
	access_token,
	service_acct,
	service_secret,
	id,
});


beforeAll(async () => {
	console.log('Authenticating Project');
	await project.auth();
	console.log('Getting All Assets');
	await project.getAll();
	console.log('Testing Begins...\n\n');

});


test('auth works', async () => {
	const metadata = await project.auth();
	const { user, project: projectMeta } = metadata;
	expect(metadata).toBeDefined();
	expect(project._authenticated).toBe(true);
	expect(metadata.user).toBeDefined();
	expect(metadata.project).toBeDefined();
	const expectedId = Number(process.env.id);
	expect(projectMeta.id).toBe(expectedId);
});



test('getSchema works', async () => {
	const schema = await project.getSchema();
	expect(schema).toBeDefined();
	expect(project._assets.schema).toBe(schema);
});

test('getDash works', async () => {
	const dashboards = await project.getDash();
	expect(dashboards).toBeDefined();
	expect(project._assets.dashboards).toBe(dashboards);
});

test('getCohorts works', async () => {
	const cohorts = await project.getCohorts();
	expect(cohorts).toBeDefined();
	expect(project._assets.cohorts).toBe(cohorts);
});

test('getCustomEvents works', async () => {
	const customEvents = await project.getCustomEvents();
	expect(customEvents).toBeDefined();
	expect(project._assets.custom_events).toBe(customEvents);
});

test('getCustomProps works', async () => {
	const customProps = await project.getCustomProps();
	expect(customProps).toBeDefined();
	expect(project._assets.custom_props).toBe(customProps);
});

test('getFormulas works', async () => {
	const formulas = await project.getFormulas();
	expect(formulas).toBeDefined();
	expect(project._assets.formulas).toBe(formulas);
});

test('getUsers works', async () => {
	const users = await project.getUsers();
	expect(users).toBeDefined();
	expect(project._assets.users).toBe(users);
});


