/**
 * @fileoverview this is a scratch file for testing the MixpanelProject class in index.js
 * it's paired with the 'scratch' launch configuration in launch.json 
 */

import Project from "./index.js";
import Payloads from "./payloads.js";
import URLs from "./urls.js";
let {
	access_token,
	// service_acct,
	// service_secret,
	id,
} = process.env;



const myp = new Project({
	access_token,
	id,
	// service_acct,
	// service_secret
});

const auth = await myp.auth();

const url = URLs.saveTheme(id);
const [themePayload, themeHeaders] = Payloads.setTheme(["#007bff", "#00a9f0", "#2196f3", "#4285f4", "#64b5f6", "#90caf9", "#bdbdbd", "#e0e0e0", "#f5f5f5", "#ffffff", "#6200ee", "#9c27b0"], "sofi");

const setTheme = await myp.request(url, themePayload, themeHeaders);

debugger;

// const everything = await myp.getAll();



debugger;