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

const myProject = new Project({
	service_acct,
	service_secret,
	id,
});

await myProject.auth();

await myProject.getSchema();

debugger;