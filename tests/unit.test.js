const MixpanelProject = require('../index.js');
const fetch = require('ak-fetch');
const urls = require('../urls');
jest.mock('ak-fetch');
jest.mock('../urls');



const options = {
	service_acct: 'test_service_acct',
	service_secret: 'test_service_secret',
	id: 'test_id',
	access_token: 'test_access_token'
};

let project;

beforeEach(() => {
	project = new MixpanelProject(options);
});

afterEach(() => {
	jest.clearAllMocks();
});

test('init works', () => {
	expect(project._name).toBeDefined();
	expect(project._writePath).toBeDefined();
	expect(project._id).toBe(options.id);
	expect(project._region).toBe('US');
	expect(project._token).toBe(null);
	expect(project._api_secret).toBe(null);
	expect(project._service_acct).toBe(options.service_acct);
	expect(project._service_secret).toBe(options.service_secret);
	expect(project._access_token).toBe(options.access_token);
	expect(project._authenticated).toBe(false);
	expect(project._metadata).toEqual({});
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
	expect(() => project.headers()).toThrow('Could not find undefined headers');
});

test('auth works (kinda)', async () => {
	fetch.mockResolvedValueOnce({ results: { user: 'test_user' } })
		.mockResolvedValueOnce({ results: { api_key: 'test_key', organizationId: 'org_id', organizationName: 'org_name', secret: 'test_secret', token: 'test_token' } })
		.mockResolvedValueOnce({ results: { workspaces: [{ id: 'workspace_id', is_global: true }] } });

	const metadata = await project.auth();
	expect(metadata).toBeDefined();
	expect(project._authenticated).toBe(true);
	expect(metadata.user).toEqual({ user: 'test_user' });
	expect(project._metadata.project).toBeDefined();
});

test('get all', async () => {
	fetch.mockResolvedValue({ results: [] });

	const allAssets = await project.getAll();
	expect(allAssets).toBeDefined();
});

test('get schema', async () => {
	fetch.mockResolvedValue({});

	const schema = await project.getSchema();
	expect(schema).toBeDefined();
});

test('get dashboards', async () => {
	fetch.mockResolvedValue({ results: [] });

	const dashboards = await project.getDash();
	expect(dashboards).toBeDefined();
});

test('get cohorts', async () => {
	fetch.mockResolvedValue({ results: [] });

	const cohorts = await project.getCohorts();
	expect(cohorts).toBeDefined();
});

test('get custom events', async () => {
	fetch.mockResolvedValue({ custom_events: [] });

	const customEvents = await project.getCustomEvents();
	expect(customEvents).toBeDefined();
});

test('get custom prop', async () => {
	fetch.mockResolvedValue({ results: [] });

	const customProps = await project.getCustomProps();
	expect(customProps).toBeDefined();
});

test('get formulas', async () => {
	fetch.mockResolvedValue({ results: [] });

	const formulas = await project.getFormulas();
	expect(formulas).toBeDefined();
});

test('get users', async () => {
	fetch.mockResolvedValue({ results: [] });

	const users = await project.getUsers();
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
	project._access_token = null;
	project._service_acct = null;
	project._service_secret = null;

	await expect(project.auth()).rejects.toThrow('Missing required authentication parameters; access_token or service_acct and service_secret');
});

test('error when missing project', async () => {
	project._id = null;

	await expect(project.auth()).rejects.toThrow('Missing required project id');
});


