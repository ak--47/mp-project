require('dotenv').config();
const MixpanelProject = require('../index.js');
const fetch = require('ak-fetch');
const urls = require('../tools/urls.js');
jest.setTimeout(60000);
// jest.mock('ak-fetch');
// jest.mock('../tools/urls.js');

const {
	access_token = "",
	service_acct = "",
	service_secret = "",
	id = "",
} = process.env;

if (!access_token || !service_acct || !service_secret || !id) {
	throw new Error('Please set the following environment variables: access_token, service_acct, service_secret, id');
}


const options = {
	service_acct,
	service_secret,
	id,
	access_token
};

let project;

beforeEach(async () => {
	project = new MixpanelProject(options);
	await project.auth();
});

afterEach(() => {
	jest.clearAllMocks();
});

test('auth works', () => {
	expect(project._name).toBeDefined();
	expect(project._writePath).toBeDefined();
	expect(project._id).toBe(options.id);
	expect(project._region).toBe('US');
	expect(project._token).toBeDefined();
	expect(project._api_secret).toBeDefined();
	expect(project._service_acct).toBe(options.service_acct);
	expect(project._service_secret).toBe(options.service_secret);
	expect(project._access_token).toBe(options.access_token);
	expect(project._authenticated).toBe(true);
	expect(project._metadata).toBeDefined();
});

test('header resolution', () => {
	project._headers = { Authorization: 'Custom Header' };
	expect(project.headers()).toEqual({ Authorization: 'Custom Header' });

	project._headers = null;
	project._auth_header_service_acct = { Authorization: 'Service Account Header' };
	expect(project.headers('service_acct')).toEqual({ Authorization: 'Service Account Header' });

	project._auth_header_service_acct = null;
	project._auth_header_access_token = { Authorization: 'Access Token Header' };
	expect(project.headers('access_token')).toEqual({ Authorization: 'Access Token Header' });

	project._auth_header_access_token = null;
	project._auth_header_service_acct = { Authorization: 'Fallback Service Account Header' };
	expect(project.headers()).toEqual({ Authorization: 'Fallback Service Account Header' });

	project._auth_header_service_acct = null;
	project._auth_header_access_token = { Authorization: 'Fallback Access Token Header' };
	expect(project.headers()).toEqual({ Authorization: 'Fallback Access Token Header' });

	// Test for throwing error
	project._auth_header_access_token = null;
	expect(() => project.headers()).toThrow('Could not find none headers');
});

test('get all', async () => {
	const allAssets = await project.getAll();
	expect(allAssets).toBeDefined();
	const {cohorts, customEvents, customProps, dashboards, formulas, schema, users} = allAssets;
	expect(cohorts).toBeDefined();
	expect(customEvents).toBeDefined();
	expect(customProps).toBeDefined();
	expect(dashboards).toBeDefined();
	expect(formulas).toBeDefined();
	expect(schema).toBeDefined();
	expect(users).toBeDefined();	
});

test('clear project assets', () => {
	project.clear();
	expect(project._assets).toEqual({
		schema: {},
		dashboards: [],
		reports: [],
		cohorts: [],
		custom_events: [],
		custom_props: [],
		formulas: [],
		users: []
	});
});

test('error on bad auth', async () => {
	project = new MixpanelProject(options);
	project._access_token = null;
	project._service_acct = null;
	project._service_secret = null;

	await expect(project.auth()).rejects.toThrow('Missing required authentication parameters; access_token or service_acct and service_secret');
});

test('error when missing project', async () => {
	project = new MixpanelProject(options);
	project._id = null;

	await expect(project.auth()).rejects.toThrow('Missing required project id');
});


