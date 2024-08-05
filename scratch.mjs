/**
 * @fileoverview this is a scratch file for testing the MixpanelProject class in index.js
 * it's paired with the 'scratch' launch configuration in launch.json 
 */

import Project from "./index.js";
const {
	access_token,
	service_acct,
	service_secret,
	id,
} = process.env;

const myp = new Project({
	service_acct,
	service_secret,
	id,
});

const auth = await myp.auth();

const everything = await myp.getAll();

debugger;