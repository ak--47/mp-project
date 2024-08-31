/**
 * @fileoverview what we have here is essentially a programmatic interface to a mixpanel project... 
 * allowing you to carry out various operations on the data or schema in any mixpanel project... from code!
 * 
 * @example copy a project schema from one project to another
 * const MixpanelProject = require('ak-mixpanel-project');
 * const projectFoo = new MixpanelProject({id: "1234", access_token: "abc123"});
 * const projectBar = new MixpanelProject({id: "5678", service_acct: "foo", service
 * await projectFoo.auth();
 * await projectBar.auth();
 * const schemaFoo = await projectFoo.getSchema();
 * const schemaBar = await projectBar.setSchema(schemaFoo);
 * const customEventsFoo = await projectFoo.getCustomEvents();
 * const customEventsBar = await projectBar.setCustomEvents(customEventsFoo);
 * 
 * 
 * 
 */

const path = require('path');
const os = require('os');
let { NODE_ENV = "unknown" } = process.env;
const fetch = require('ak-fetch');
const urls = require('./tools/urls');
const payloads = require('./tools/payloads');


/** 
 * @typedef {Object} MpProjectOptions
 * @property {string} [name] - project name
 * @property {string} [writePath] - path to write files
 * @property {string} [id] - project id
 * @property {string} [region] - project region
 * @property {string} [token] - project token
 * @property {string} [api_secret] - project api secret
 * @property {string} [service_acct] - service account
 * @property {string} [service_secret] - service secret
 * @property {string} [access_token] - access token
 * 
 */



class MixpanelProject {
	/**
	 * @param  {MpProjectOptions} options
	 */
	constructor(options = {}) {
		this._name = options.name || nameMaker() || 'mixpanel-project';
		this._writePath = options.writePath || os.tmpdir();
		this._id = options.id || null;
		this._region = options.region?.toUpperCase() || 'US';
		this._token = options.token || null;
		this._api_secret = options.api_secret || null;
		this._service_acct = options.service_acct || null;
		this._service_secret = options.service_secret || null;
		this._access_token = options.access_token || null;
		this._headers = options._headers || null;
		this._org_id = options.org_id || null;
		this._workspace_id = options.workspace_id || null;
		this.clear();

		({ NODE_ENV = "unknown" } = process.env);
		if (NODE_ENV === 'dev' || NODE_ENV === 'test') {
			this._writePath = path.resolve('./tmp');
		}

		this._authenticated = false;
		this._metadata = {};
	}
	headers(type) {
		//always use manually set headers if they exist; they usually WON'T
		if (this._headers) return this._headers;

		// sometimes we will be explicit
		if (type === 'service_acct') return this._auth_header_service_acct || {};
		if (type === 'access_token') return this._auth_header_access_token || {};

		// if we are not explicit, just use whatever is available
		if (this._auth_header_service_acct) return this._auth_header_service_acct || {};
		if (this._auth_header_access_token) return this._auth_header_access_token || {};

		//should never get here
		if (NODE_ENV === 'dev') debugger;
		throw new Error(`Could not find ${type} headers`);
	}
	get schema() {
		return this._assets.schema;
	}
	get dashboards() {
		return this._assets.dashboards;
	}
	get reports() {
		return this._assets.reports;
	}
	get cohorts() {
		return this._assets.cohorts;
	}
	get custom_events() {
		return this._assets.custom_events;
	}
	get custom_props() {
		return this._assets.custom_props;
	}
	get formulas() {
		return this._assets.formulas;
	}

	async auth() {
		await authUser.call(this);
	}

	async getAll() {
		if (!this._authenticated) await this.auth();
		this.clear();
		const schema = await this.getSchema();
		const dashboards = await this.getDash();
		const cohort = await this.getCohorts();
		const customEvents = await this.getCustomEvents();
		const customProps = await this.getCustomProps();
		const formulas = await this.getFormulas();
		const users = await this.getUsers();
		return { schema, dashboards, cohort, customEvents, customProps, formulas, users };
	}


	async getSchema() {
		if (!this._authenticated) await this.auth();
		if (Object.keys(this._assets.schema).length) return this._assets.schema;
		const schema = await getSchemaUnofficial({
			headers: this.headers(),
			project: this._id,
			workspace: this._workspace_id

		});

		this._assets.schema = schema;
		return schema;
	}

	async setSchema(schema) {
		//todo
	}

	async request(url, payload = null, method = "POST", additionalHeaders = {}, blacklist = true) {
		if (!this._authenticated) await this.auth();
		if (Object.keys(additionalHeaders).length) additionalHeaders = { "content-type": "application/json", "accept": "application/json" };
		const headers = { ...this.headers(), ...additionalHeaders };
		if (blacklist) for (const key of payloads.blacklistKeys) if (payload[key]) delete payload[key];
		const response = await fetch({ method, url, headers, data: payload, noBatch: true });
		return response;
	}


	async getDash(dashId) {
		if (!this._authenticated) await this.auth();
		if (dashId) return await fetch({ url: urls.getSingleDash(this._workspace_id, dashId, this._region), headers: this.headers() });
		if (this._assets.dashboards.length) return this._assets.dashboards;
		const { results: dashboards } = await fetch({
			method: 'GET',
			url: urls.getAllDash(this._workspace_id, this._region),
			headers: this.headers()
		});
		const dashIds = dashboards.map(d => d.id);
		const allDashboards = (await batchDashboards(dashIds, this._workspace_id, this._region, this.headers()))
			.map(d => d.results);
		for (const dash of allDashboards) {
			this._assets.dashboards.push(dash);
			const { contents = {} } = dash;
			const { report: reports = {} } = contents;
			this._assets.reports.push(...Object.values(reports));
		}
		return allDashboards;
	}

	async createDash(title, description = "") {
		if (!this._authenticated) await this.auth();
		if (!title) title = nameMaker(3, ' ');
		const createUrl = urls.makeDash(this._workspace_id, this._region);
		const createPayload = { title: "Untitled" };
		const createResponse = await this.request(createUrl, createPayload);
		const { id: dashId } = createResponse;
		const editPayload = { title, description };
		const editUrl = urls.makeReport(this._workspace_id, dashId, this._region);
		const editResponse = await this.request(editUrl, editPayload, "PATCH");

		const sharePayload = { "id": dashId, "projectShares": [{ "id": this._id, "canEdit": true }] };
		const shareUrl = urls.shareDash(this._id, dashId, this._region);
		const shareResponse = await this.request(shareUrl, sharePayload, "POST");

		const pinDashUrl = urls.pinDash(this._workspace_id, dashId, this._region);
		const pinDashResponse = await this.request(pinDashUrl, {}, "POST");

		return { createResponse, editResponse, shareResponse, pinDashResponse };
	}



	async getCohorts() {
		if (!this._authenticated) await this.auth();
		if (this._assets.cohorts.length) return this._assets.cohorts;
		const { results: cohorts = [] } = await fetch({
			method: 'GET',
			url: urls.getCohorts(this._workspace_id, this._region),
			headers: this.headers()
		});
		this._assets.cohorts = cohorts;
		return cohorts;

	}

	async setCohorts(cohorts) {
		if (!Array.isArray(cohorts)) cohorts = [cohorts];
	}

	async getCustomEvents() {
		if (!this._authenticated) await this.auth();
		if (this._assets.custom_events.length) return this._assets.custom_events;
		const { custom_events = [] } = await fetch({
			method: 'GET',
			url: urls.getCustomEvents(this._workspace_id, this._region),
			headers: this.headers()
		});
		this._assets.custom_events = custom_events;
		return custom_events;
	}

	async setCustomEvents(customEvents) {
		if (!Array.isArray(customEvents)) customEvents = [customEvents];
	}

	async getCustomProps() {
		if (!this._authenticated) await this.auth();
		if (this._assets.custom_props.length) return this._assets.custom_props;
		const { results: custom_props = [] } = await fetch({
			method: 'GET',
			url: urls.getCustomProps(this._workspace_id, this._region),
			headers: this.headers()
		});
		this._assets.custom_props = custom_props;
		return custom_props;
	}

	async setCustomProps(customProps) {
		if (!Array.isArray(customProps)) customProps = [customProps];
	}

	async getFormulas() {
		if (!this._authenticated) await this.auth();
		if (this._assets.formulas.length) return this._assets.formulas;
		const { results: formulas = [] } = await fetch({
			method: 'GET',
			url: urls.getFormulas(this._id, this._region),
			headers: this.headers()
		});
		this._assets.formulas = formulas;
		return formulas;
	}

	async setFormulas(formulas) {
		if (!Array.isArray(formulas)) formulas = [formulas];
	}

	async getUsers() {
		if (!this._authenticated) await this.auth();
		const { results: users = [] } = await fetch({
			method: 'GET',
			url: urls.getUsers(this._id, this._region),
			headers: this.headers()
		});
		this._assets.users = users;
		return users;

	}

	async addUsers(users) {
		if (!Array.isArray(users)) users = [users];
	}

	async removeUsers(users) {
		if (!Array.isArray(users)) users = [users];
	}


	clear() {
		this._assets = {
			schema: {},
			dashboards: [],
			reports: [],
			cohorts: [],
			custom_events: [],
			custom_props: [],
			formulas: [],
			users: []
		};
	}



	static async makeProject(opts = {}) {
		if (!this._access_token) throw new Error('Missing access_token');
		if (!this._org_id) throw new Error('Missing org_id');
		if (!this._authenticated) await this.auth();
		const { groupKeys = {} } = opts;

	}

}


async function authUser() {
	if (this._authenticated && Object.keys(this._metadata).length) return this._metadata;
	if (!this._access_token && (!this._service_acct && !this._service_secret)) {
		throw new Error("Missing required authentication parameters; access_token or service_acct and service_secret");
	}
	if (!this._id) {
		throw new Error("Missing required project id");
	}
	let authValue = '';

	if (this._service_acct && this._service_secret) {
		authValue = `Basic ${Buffer.from(this._service_acct + ":" + this._service_secret).toString('base64')}`;
		this._auth_header_service_acct = { Authorization: authValue };
	}
	if (this._access_token) {
		authValue = `Bearer ${this._access_token}`;
		this._auth_header_access_token = { Authorization: authValue };
	}
	if (!authValue) throw new Error('Missing auth value');

	try {
		const { results: userInfo = {} } = await fetch({ method: 'GET', url: urls.me(this._region), headers: this.headers() });
		this._metadata.user = userInfo;
	}
	catch (e) {
		console.error(`user auth error`, e);
		if (NODE_ENV === 'dev') debugger;
		throw e;
	}
	try {
		const { results = {} } = await fetch({ method: 'GET', url: urls.projectMetaData(this._id, this._region), headers: this.headers('service_acct') });
		const { api_key, organizationId: organizationId, organizationName, secret, token } = results;
		this._org_id = organizationId;
		this._org_name = organizationName;
		this._api_secret = secret;
		this._token = token;
		this.api_key = api_key;
		this._metadata.project = results;
		const { results: resultsAlso = {} } = await fetch({ method: 'GET', url: urls.projectMetaAlso(this._id, this._region), headers: this.headers() });
		const { workspaces = {} } = resultsAlso;

		for (const space in workspaces) {
			for (const key in workspaces[space]) {
				if (key === 'is_global' && workspaces[space][key] === true) {
					this._workspace_id = workspaces[space].id;
					break;
				}
			}
		}

		this._metadata.project = { ...this._metadata.project, ...resultsAlso };
	}
	catch (e) {
		console.error(`project auth error`, e);
		if (NODE_ENV === 'dev') debugger;
		throw e;
	}
	this._authenticated = true;
	return this._metadata;

}

async function getSchemaUnofficial(creds) {
	const { headers, project, workspace } = creds;

	const schemaEvents = await fetch({
		method: 'GET',
		url: urls.lexicon(project, workspace, 'events'),
		headers
	});

	const schemaProps = await fetch({
		method: 'GET',
		url: urls.lexicon(project, workspace, 'props'),
		headers
	});

	const schemaUsers = await fetch({
		method: 'GET',
		url: urls.lexicon(project, workspace, 'users'),
		headers
	});

	// const schemaGroups = await fetch({
	// 	method: 'GET',
	// 	url: urls.lexicon(project, workspace, 'groups'),
	// 	headers
	// });

	const schema = {
		event: schemaEvents.results,
		properties: schemaProps.results,
		users: schemaUsers.results,
		// groups: schemaGroups.results
	};

	return schema;


}

async function postSchemaUnofficial(creds, schema) {
	let { auth, project, workspace, region } = creds;

}

async function batchDashboards(dashIds, workspace, region, auth, limit = 10) {
	const batches = [];
	for (let i = 0; i < dashIds.length; i += limit) {
		batches.push(dashIds.slice(i, i + limit));
	}
	const results = [];
	for (const batch of batches) {
		const fetchPromises = batch.map(dashId =>
			fetch({
				method: 'GET',
				url: urls.getSingleDash(workspace, dashId, region),
				headers: auth
			})
		);

		const batchResultArray = await Promise.all(fetchPromises);
		results.push(...batchResultArray);

	}
	return results;
}

async function makeProject(orgId, oauthToken = OAUTH_TOKEN) {
	const excludedOrgs = [
		1, // Mixpanel
		328203, // Mixpanel Demo
		1673847, // SE Demo
		1866253 // Demo Projects
	];
	if (!orgId || !oauthToken) throw new Error('Missing orgId or oauthToken');
	const url = `https://mixpanel.com/api/app/organizations/${orgId}/create-project`;
	const projectPayload = {
		"cluster_id": 1,
		"project_name": `GTM Metrics: Test Env ${rand(1000, 9999)}`,
		"timezone_id": 404
	};

	const payload = {
		method: 'POST',

		headers: {
			Authorization: `Bearer ${oauthToken}`,
		},
		body: JSON.stringify(projectPayload)

	};

	const projectsReq = await fetch(url, payload);
	const projectsRes = await projectsReq.json();
	const { api_secret, id, name, token } = projectsRes.results;

	const data = {
		api_secret,
		id,
		name,
		token,
		url: `https://mixpanel.com/project/${id}/app/settings#project/${id}`

	};

	return data;
}

async function getUser(oauthToken = OAUTH_TOKEN) {
	const user = {};
	try {
		if (oauthToken) {
			const info = await fetch(`https://mixpanel.com/api/app/me/?include_workspace_users=false`, { headers: { Authorization: `Bearer ${oauthToken}` } });
			const data = await info.json();
			if (data?.results) {
				const { user_name = "", user_email = "" } = data.results;
				if (user_name) user.name = user_name;
				if (user_email) user.email = user_email;
				const foundOrg = Object.values(data.results.organizations).filter(o => o.name.includes(user_name))?.pop();
				if (foundOrg) {
					user.orgId = foundOrg.id?.toString();
					user.orgName = foundOrg.name;
				}
				if (!foundOrg) {
					// the name is not in the orgs, so we need to find the org in which the user is the owner
					const ignoreProjects = [1673847, 1866253, 328203];
					const possibleOrg = Object.values(data.results.organizations)
						.filter(o => o.role === 'owner')
						.filter(o => !ignoreProjects.includes(o.id))?.pop();
					if (possibleOrg) {
						user.orgId = possibleOrg?.id?.toString();
						user.orgName = possibleOrg.name;
					}
				}
			}
		}
	}
	catch (err) {
		console.error('get user err', err);
	}

	return user;
}

async function addGroupKeys(groupKeyDfns = [], projectId, oauthToken = OAUTH_TOKEN) {
	const url = `https://mixpanel.com/api/app/projects/${projectId}/data-groups/`;
	const results = [];
	loopKeys: for (const { display_name, property_name } of groupKeyDfns) {
		const body = {
			display_name,
			property_name
		};
		const payload = {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${oauthToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		};

		try {
			const res = await fetch(url, payload);
			const data = await res.json();
			results.push(data?.results);
		}
		catch (err) {
			console.error('add group keys err', err);
			continue loopKeys;
		}

	}
	return results;
}

function nameMaker(words = 3, separator = "-") {
	const adjs = [
		"dark", "grim", "swift", "brave", "bold", "fiery", "arcane",
		"rugged", "calm", "wild", "brisk", "dusty", "mighty", "sly",
		"old", "ghostly", "frosty", "gilded", "murky", "grand", "sly",
		"quick", "cruel", "meek", "glum", "drunk", "slick", "bitter",
		"nimble", "sweet", "tart", "tough"
	];

	const nouns = [
		"mage", "inn", "imp", "bard", "witch", "drake", "knight", "brew",
		"keep", "blade", "beast", "spell", "tome", "crown", "ale", "bard",
		"joke", "maid", "elf", "orc", "throne", "quest", "scroll", "fey",
		"pixie", "troll", "giant", "vamp", "ogre", "cloak", "gem", "axe",
		"armor", "fort", "bow", "lance", "moat", "den"
	];

	const verbs = [
		"cast", "charm", "brawl", "brew", "haunt", "sail", "storm", "quest",
		"joust", "feast", "march", "scheme", "raid", "guard", "duel",
		"trick", "flee", "prowl", "forge", "explore", "vanish", "summon",
		"banish", "bewitch", "sneak", "chase", "ride", "fly", "dream", "dance"
	];

	const adverbs = [
		"boldly", "bravely", "slyly", "wisely", "fiercely", "stealthily", "proudly", "eagerly",
		"quietly", "loudly", "heroically", "craftily", "defiantly", "infamously", "cleverly", "dastardly"
	];

	const continuations = [
		"and", "of", "in", "on", "under", "over", "beyond", "within", "while", "during", "after", "before",
		"beneath", "beside", "betwixt", "betwain", "because", "despite", "although", "however", "nevertheless"
	];

	let string;
	const cycle = [adjs, nouns, verbs, adverbs, continuations];
	for (let i = 0; i < words; i++) {
		const index = i % cycle.length;
		const word = cycle[index][Math.floor(Math.random() * cycle[index].length)];
		if (!string) {
			string = word;
		} else {
			string += separator + word;
		}
	}

	return string;
};

module.exports = MixpanelProject;