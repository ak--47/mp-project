/**
 * @fileoverview what we have here is essentially a programmatic interface to a mixpanel project... 
 * allowing you to carry out various operations on the data or schema in any mixpanel project... from code!
 */


const fs = require('fs');
const path = require('path');
const os = require('os');
const v8 = require('v8');
let { NODE_ENV = "unknown" } = process.env;
const fetch = require('ak-fetch');
const urls = require('./urls');

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
		this._name = options.name || generateName() || 'mixpanel-project';
		this._writePath = options.writePath || os.tmpdir();
		this._id = options.id || null;
		this._region = options.region?.toUpperCase() || 'US';
		this._token = options.token || null;
		this._api_secret = options.api_secret || null;
		this._service_acct = options.service_acct || null;
		this._service_secret = options.service_secret || null;
		this._access_token = options.access_token || null;
		this._auth_headers = options.auth_headers || {};
		this._org_id = options.org_id || null;
		this._workspace_id = options.workspace_id || null;

		({ NODE_ENV = "unknown" } = process.env);
		if (NODE_ENV === 'dev' || NODE_ENV === 'test') {
			this._writePath = path.resolve('./tmp');
		}

		this._authenticated = false;
		this._metadata = {};
		this._schema = {};


	}


	// core things we can do in a project...
	async auth() {
		if (!this._access_token && (!this._service_acct && !this._service_secret)) {
			throw new Error("Missing required authentication parameters; access_token or service_acct and service_secret");
		}
		if (!this._id) {
			throw new Error("Missing required project id");
		}
		let authValue = '';

		if (this._service_acct && this._service_secret) {
			authValue = `Basic ${Buffer.from(this._service_acct + ":" + this._service_secret).toString('base64')}`;
		}
		if (this._access_token) {
			authValue = `Bearer ${this._access_token}`;
		}
		this._auth_headers = { Authorization: authValue };
		try {
			const { results } = await fetch({ method: 'GET', url: urls.me(this._region), headers: this._auth_headers });
			this._metadata.user = results;
		}
		catch (e) {
			console.error(`user auth error`, e);
			if (NODE_ENV === 'dev') debugger;
			throw e;
		}
		try {
			const { results } = await fetch({ method: 'GET', url: urls.projectMetaData(this._id, this._region), headers: this._auth_headers });
			const { api_key, organizationId: organizationId, organizationName, secret, token } = results;
			this._org_id = organizationId;
			this._org_name = organizationName;
			this._api_secret = secret;
			this._token = token;
			this.api_key = api_key;
			this._metadata.project = results;

			const { results: resultsAlso } = await fetch({ method: 'GET', url: urls.projectMetaAlso(this._id, this._region), headers: this._auth_headers });
			const { workspaces } = resultsAlso;

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

	async getDash() {

	}

	async makeDash() {

	}

	async makeReport() {

	}

	async doQuery() {

	}



	async getGroupKeys() {

	}

	async setGroupKeys() {

	}

	async getSchema() {
		const schema = await getSchemaUnofficial({
			headers: this._auth_headers,
			project: this._id,
			workspace: this._workspace_id

		})

		this._schema = schema;
	}

	async setSchema() {

	}

	async makeCohorts() {

	}

	async getCohorts() {


	}

	static async makeProject() {

	}

}


function generateName(words = 3, separator = "-") {
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


	// fetch("https://mixpanel.com/api/app/workspaces/3872877/data-definitions/properties", {
	// 	"headers": {
	// 	  "accept": "*/*",
	// 	  "accept-language": "en-US,en;q=0.9",
	// 	  "authorization": "Session",
	// 	  "cache-control": "no-cache",
	// 	  "content-type": "text/plain;charset=UTF-8",
	// 	  "pragma": "no-cache",
	// 	  "priority": "u=1, i",
	// 	  "request-url": "https://mixpanel.com/project/3366357/view/3872877/app/lexicon#transformations/event-properties/%40Metadata.LastRouter",
	// 	  "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\"",
	// 	  "sec-ch-ua-mobile": "?0",
	// 	  "sec-ch-ua-platform": "\"macOS\"",
	// 	  "sec-fetch-dest": "empty",
	// 	  "sec-fetch-mode": "cors",
	// 	  "sec-fetch-site": "same-origin",
	// 	  "x-csrftoken": "oDXrYJKuefrwhuxz68eVXb9WiB17jgOHq6Bw3y5kIVBEv6Q3ZrKPOxlkExKLnivS",
	// 	  "cookie": "_gd_visitor=d88440c1-0d89-46b8-8914-391deb71ff5f; g_state={\"i_l\":0}; mp_user=\"eyJpZCI6NDg2ODY3LCJuYW1lIjoiQUsgIiwiZW1haWwiOiJhYXJvbi5rcml2aXR6a3lAbWl4cGFuZWwuY29tIn0=\"; mp__origin=adwords-mp1; mp__origin_referrer=\"https://mixpanel.com/\"; csrftoken=oDXrYJKuefrwhuxz68eVXb9WiB17jgOHq6Bw3y5kIVBEv6Q3ZrKPOxlkExKLnivS; sessionid=lhzs2nvkis3w2h3zmzzaevnlccqe08vx; mp_distinct_id=486867; __mp_opt_in_out_tracking_metrics-1=1; __mp_opt_in_out_cookies_metrics-1=1; _hjSessionUser_2879837=eyJpZCI6IjYwOGM4ZThkLTJjNjctNWQzMy05YWMyLTI3NmI2Yzc5ZTI0OSIsImNyZWF0ZWQiOjE3MTk0NTkxMTYyMzAsImV4aXN0aW5nIjp0cnVlfQ==; _fbp=fb.1.1719590077049.950131813777744073; _gcl_au=1.1.174591907.1719590078; ajs_anonymous_id=1898e0138ba8e9-059ef4d47da2be-1b525634-1fa400-1898e0138bcd05; wp-wpml_current_language=en; _gd_svisitor=91d7c61721ba0000b151da648d0000006f822601; G_ENABLED_IDPS=google; mp_7ba9b7d8d8252c34fc2e7a3d15ede6df_mixpanel=%7B%22distinct_id%22%3A%20486867%2C%22%24device_id%22%3A%20%22190a8a13e156ae-0996d406dc3db6-19525637-1fa400-190a8a13e156ae%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fmixpanel.com%2Fproject%2F3187769%2Fview%2F3699049%2Fapp%2Fboards%2F%3Fmp_source%3Dslack%22%2C%22%24initial_referring_domain%22%3A%20%22mixpanel.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22%24user_id%22%3A%20486867%7D; GCP_IAP_UID=108517522714556934147; _gid=GA1.2.300585594.1721928195; _clck=130k11b%7C2%7Cfns%7C0%7C1639; mp_account_id=4310288; mp_c35254c786d5aace8e884528f6be2ed7_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A1899309cfe95ab-08a77b9227a696-1a525634-1fa400-1899309cfe95ab%22%2C%22%24device_id%22%3A%20%221899309cfe95ab-08a77b9227a696-1a525634-1fa400-1899309cfe95ab%22%2C%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%7D; _rdt_uuid=1719590076734.41952b94-34f2-4e70-a108-aa2ac758d411; _uetsid=930040104aaa11efaf352dd3697091f7; _uetvid=d5b7c460224911eda52a9542b106156b; _ga=GA1.2.334719697.1719590078; _clsk=18yslsj%7C1722027291378%7C7%7C1%7Cv.clarity.ms%2Fcollect; _ga_6NLLN3BJ6F=GS1.1.1722027204.34.1.1722027862.60.1.1313417493; _hjSession_2879837=eyJpZCI6ImIxNmJkOTNkLWQzY2EtNGQ2Yy04OTQxLTJhMGRiMGRlOWUyMCIsImMiOjE3MjIwNTEzOTg5ODksInMiOjEsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowfQ==; mp_persistence=%7B%22project%22%3A3366357%2C%22workspace%22%3A3872877%2C%22report_path%22%3A%22lexicon%23transformations%22%7D; mp_a97d6abb431eaf5735b8ba5688590bc2_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A19057bfe870ce9-0c4e43f37edfd7-19525637-1fa400-19057bfe870ce9%22%2C%22%24device_id%22%3A%20%2219057bfe870ce9-0c4e43f37edfd7-19525637-1fa400-19057bfe870ce9%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22%24search_engine%22%3A%20%22google%22%7D; mp_metrics-1_mixpanel=%7B%22distinct_id%22%3A%20%22486867%22%2C%22%24device_id%22%3A%20%22190f0d1fea94fb-0f89f261077342-19525637-1fa400-190f0d1fea94fb%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%22486867%22%2C%22Project%20owner%20billing%20account%20ID%22%3A%20%224310288%22%2C%22first%20touch%20landing%20page%20url%22%3A%20%22https%3A%2F%2Fmixpanel.com%2Fproject%2F3366357%2Fview%2F3872877%2Fapp%2Flexicon%23transformations%22%2C%22origin%22%3A%20%22adwords-mp1%22%2C%22origin_referrer%22%3A%20%22https%3A%2F%2Fmixpanel.com%2F%22%2C%22origin_domain%22%3A%20%22mixpanel.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22Has%20Boards%20UI%20Test%22%3A%20true%2C%22role%22%3A%20%22owner%22%7D",
	// 	  "Referer": "https://mixpanel.com/project/3366357/view/3872877/app/lexicon",
	// 	  "Referrer-Policy": "strict-origin-when-cross-origin"
	// 	},
	// 	"body": "{\"id\":87527897,\"displayName\":\"Meta Data Last Router\"}",
	// 	"method": "PATCH"
	//   });
}



module.exports = MixpanelProject;