
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
	console.log('Testing Begins...\n\n');

});


test('crud: dashboard', async () => {
	const dashboard = await project.createDash('Test Dashboard', 'light');
	expect(dashboard).toBeDefined();
	const { createResponse, editResponse, pinDashResponse, shareResponse } = dashboard;
	expect(createResponse).toBeDefined();
	expect(editResponse).toBeDefined();
	expect(pinDashResponse).toBeDefined();
	expect(shareResponse).toBeDefined();
	expect(createResponse.status).toBe('ok');
	expect(editResponse.status).toBe('ok');
	expect(pinDashResponse.status).toBe('ok');
	expect(shareResponse.status).toBe('ok');
	const dashId = createResponse.results.id;
	const deletedDashboard = await project.deleteDash(dashId);
	expect(deletedDashboard).toBeDefined();
	expect(deletedDashboard.status).toBe('ok');
});


test('crud: report', async () => {
	const dash = await project.createDash('Test Dashboard', 'light');
	const dashId = dash.createResponse.results.id;

	const report = await project.createReport('Test Report', 'light', dashId);
	expect(report).toBeDefined();

	const reportId = report.results.id;
	const deletedReport = await project.deleteReport(dashId, reportId);
	expect(deletedReport).toBeDefined();
	expect(deletedReport.status).toBe('ok');

	const deletedDashboard = await project.deleteDash(dashId);
	expect(deletedDashboard).toBeDefined();
	expect(deletedDashboard.status).toBe('ok');
});

test('crud: cohort', async () => { 
	const cohort = await project.createCohort('Test Cohort', 'light', [{ event: 'Test Event', days: 1 }]);
	expect(cohort).toBeDefined();
	expect(cohort.results).toBeDefined();
	expect(cohort.status).toBe('ok');
	const cohortId = cohort.results.id;	
	const deletedCohort = await project.deleteCohort(cohortId);
	expect(deletedCohort).toBeDefined();
	expect(deletedCohort.status).toBe('ok');
});

test('crud: formula', async () => {
	const formula = await project.createFormula('Test Formula', 'light', 'SUM(column1)');
	expect(formula).toBeDefined();
	expect(formula.results).toBeDefined();
	expect(formula.status).toBe('ok');
	const formulaId = formula.results.id;
	const deletedFormula = await project.deleteFormula(formulaId);
	expect(deletedFormula).toBeDefined();
	expect(deletedFormula.status).toBe('ok');
});

test('crud: custom event', async () => {
	const customEvent = await project.createCustomEvent('Test Event', 'light', { eventType: 'click', selector: '#test-button' });
	expect(customEvent).toBeDefined();
	expect(customEvent.results).toBeDefined();
	expect(customEvent.status).toBe('ok');
	const eventId = customEvent.results.id;
	const deletedEvent = await project.deleteCustomEvent(eventId);
	expect(deletedEvent).toBeDefined();
	expect(deletedEvent.status).toBe('ok');
});

test('crud: custom property', async () => {
	const customProperty = await project.createCustomProperty('Test Property', 'light', { key: 'testKey', value: 'testValue' });
	expect(customProperty).toBeDefined();
	expect(customProperty.results).toBeDefined();
	expect(customProperty.status).toBe('ok');
	const propertyId = customProperty.results.id;
	const deletedProperty = await project.deleteCustomProperty(propertyId);
	expect(deletedProperty).toBeDefined();
	expect(deletedProperty.status).toBe('ok');
});

test('crud: user', async () => {
	const user = await project.createUser('Test User', 'light', { email: 'test@example.com', password: 'password123' });
	expect(user).toBeDefined();
	expect(user.results).toBeDefined();
	expect(user.status).toBe('ok');
	const userId = user.results.id;
	const deletedUser = await project.deleteUser(userId);
	expect(deletedUser).toBeDefined();
	expect(deletedUser.status).toBe('ok');
});

test('crud: schema', async () => {
	const schema = await project.createSchema('Test Schema', 'light', { columns: ['column1', 'column2'] });
	expect(schema).toBeDefined();
	expect(schema.results).toBeDefined();
	expect(schema.status).toBe('ok');
	const schemaId = schema.results.id;
	const deletedSchema = await project.deleteSchema(schemaId);
	expect(deletedSchema).toBeDefined();
	expect(deletedSchema.status).toBe('ok');
});

test('crud: theme', async () => {
	const theme = await project.createTheme('Test Theme', 'light', { primaryColor: '#000000', secondaryColor: '#ffffff' });
	expect(theme).toBeDefined();
	expect(theme.results).toBeDefined();
	expect(theme.status).toBe('ok');
	const themeId = theme.results.id;
	const deletedTheme = await project.deleteTheme(themeId);
	expect(deletedTheme).toBeDefined();
	expect(deletedTheme.status).toBe('ok');
});
