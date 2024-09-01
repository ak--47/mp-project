const dayjs = require('dayjs');
const URLs = require('./urls.js');
const insightsTemplate = require('../templates/models/insights-temp.json');
const funnelsTemplate = require('../templates/models/funnels-temp.json');
const flowsTemplate = require('../templates/models/flows-temp.json');
const retentionTemplate = require('../templates/models/retention-temp.json');
const customEventTemplate = require('../templates/models/custom-event-temp.json');
const customPropTemplate = require('../templates/models/custom-prop-temp.json');
const cohortTemplate = require('../templates/models/cohort-temp.json');
const sortingTemplate = require('../templates/models/sorting-temp.json');




/**
 * sets the color theme for a project
 * @param  {string[]} colors
 * @param  {string} name
 * @param  {number} project_id
 */
module.exports.setTheme = function (colors, name, project_id) {
	if (!colors) colors = ["#6AFF57", "#57443F", "#3B7974", "#826018", "#731128", "#3B586C", "#593419", "#0D7EA0", "#1A804F", "#BB4434", "#070208", "#05433E"];
	let url = URLs.saveTheme(project_id);
	const payload = {
		"type": "categorical",
		"name": name,
		"data": {
			"colors": colors,
		},
		"global_access_type": "editor"
	};
	cleanPayload(payload);
	return [url, payload];
};


/**
 * @typedef {Object} ReportPayload
 * @property {string} [shape] - The shape of the report, e.g., "line".
 * @property {number} [days] - The number of days to include in the report.
 * @property {Array<string>} [breakdowns] - An array of breakdowns.
 * @property {Array<Metric>} [blocks] - An array of event metrics.
 */

/**
 * @typedef {Object} Metric
 * @property {string} ev
 * @property {string} maths
 */

/**
 * creates a new report URL + payload for a particular dashboard
 * @param  {string} name
 * @param  {string} desc
 * @param  {number} workspace
 * @param  {number} dash
 * @param  {ReportPayload} reportPayload
 * @param  {'insights' | 'funnels' | 'flows' | 'retention'} type
 * @param  {string} [region]
 */
module.exports.newReport = function (name, desc, workspace, dash, reportPayload = {}, type = "insights", region = "US") {
	const { days = 30, shape = "line", breakdowns = [], blocks = [{ ev: "$all_events", maths: "total" }] } = reportPayload;
	let template;
	let url = URLs.createReport(workspace, dash, region);
	switch (type) {
		case "insights":
			template = insightsTemplate;
			break;
		case "funnels":
			template = funnelsTemplate;
			break;
		case "flows":
			template = flowsTemplate;
			break;
		case "retention":
			template = retentionTemplate;
			break;
		default:
			throw new Error(`type ${type} is invalid type; must be one of 'insights', 'funnels', 'flows', or 'retention'`);
	}

	// date stuff
	if (days) {
		template.time = [{
			"dateRangeType": "in the last",
			"window": {
				"value": days,
				"unit": "day"
			},
			"unit": "day"
		}];
	}

	if (shape) {
		template.displayOptions.chartType = shape;
	}

	const payload = {
		"content": {
			"action": "create",
			"content_type": "report",
			"content_params": {
				"bookmark": {
					"type": type,
					name: name,
					description: desc,
					"dashboard_id": dash,
					"params": JSON.stringify(template)
				}
			}
		}
	};
	cleanPayload(payload);
	return [url, payload];
};

/**
 * creates a new cohort URL and payload
 * @param  {string} name
 * @param  {string} desc
 * @param  {number} workspace
 * @param  {{event: string, days: number}[]} cohortPayload={}
 * @param  {string} region="US"
 */
module.exports.newCohort = function (name, desc, workspace, cohortPayload = {}, region = "US") {
	let url = URLs.createCohort(workspace, region);
	const payload = {};
	let template = cohortTemplate.groups[0].filters[0];
	const { events = [] } = eventPayload;
	for (const ev of events) {
		const obj = clone(template);
		obj.customProperty.behavior.event.value = ev.event;
		obj.customProperty.behavior.dateRange.window.value = ev.days;
		customEvPayload.push(obj);
	}
	cleanPayload(payload);
	return [url, payload];
};

/**
 * creates a new custom event URL and payload
 * @param  {string} name
 * @param  {string} desc
 * @param  {number} workspace
 * @param  {{events: string[]}} eventPayload={}
 * @param  {string} region="US"
 */
module.exports.newCustomEvent = function (name, workspace, eventPayload = {}, region = "US") {
	let url = URLs.createCustomEvent(workspace, region);
	let template = customEventTemplate[0];
	const { events = [] } = eventPayload;
	const customEvPayload = [];
	for (const ev of events) {
		const obj = clone(template);
		obj.event = ev;
		customEvPayload.push(obj);
	}

	cleanPayload(customEvPayload);
	const payload = new FormData();
	payload.append('name', name);
	payload.append('alternatives', JSON.stringify(customEvPayload));
	return [url, payload];
};

/**
 * creates a new custom property URL and payload
 * @param  {string} name
 * @param  {string} desc
 * @param  {number} workspace
 * @param  {{displayFormula: Object, composedProperties: object}} propPayload={}
 * @param  {string} region="US"
 */
module.exports.newCustomProp = function (name, desc, workspace, propPayload = {}, region = "US") {
	let url = URLs.createCustomProp(workspace, region);

	const payload = customPropTemplate;
	payload.name = name;
	payload.description = desc;
	const {
		displayFormula = {},
		composedProperties = {},
		resourceType = "events",
		propertyType = "string",
		exampleValue = ""
	} = propPayload;
	payload.displayFormula = displayFormula;
	payload.composedProperties = composedProperties;
	payload.resourceType = resourceType;
	payload.propertyType = propertyType;
	payload.exampleValue = exampleValue;
	cleanPayload(payload);
	return [url, payload];
};







// layout payload
const layout = { "layout": { "rows": [{ "height": 0, "cells": [{ "id": "fEGqmELw", "width": 6 }, { "id": "dQ32tc8d", "width": 6 }], "id": "TUvsEPn4" }, { "height": 0, "cells": [], "id": "qATtSFxj" }], "rows_order": ["TUvsEPn4", "bTJDNg75", "qATtSFxj"] } };











module.exports.cleanPayload = cleanPayload;


function cleanPayload(payload) {
	//recursively remove blacklisted keys
	for (let key in payload) {
		if (blacklistKeys.includes(key)) {
			delete payload[key];
		} else if (typeof payload[key] === 'object') {
			cleanPayload(payload[key]);
		}
	}
	// add sort layout
	// payload.sorting = sortingTemplate.sorting;
}


// blacklisted keys
const blacklistKeys = [
	"TEXT",
	"MEDIA",
	"LAYOUT",
	"REPORTS",
	"dashboard_id",
	'last_modified_by_name',
	'last_modified_by_id',
	'last_modified_by_email',
	"id",
	"is_private",
	"creator",
	"creator_id",
	"creator_name",
	"creator_email",
	"is_restricted",
	"modified",
	"is_favorited",
	"pinned_date",
	"generation_type",
	"layout_version",
	"can_see_grid_chameleon",
	"can_update_basic",
	"can_view",
	"allow_staff_override",
	"is_superadmin",
	"can_share",
	"can_pin_dashboards",
	"can_update_restricted",
	"can_update_visibility",
	"created",
	"project_id",
	"workspace_id",
	"original_type",
	"include_in_dashboard",
	"is_default",
	"metadata",
	"dashboard",
	"is_visibility_restricted",
	"is_modification_restricted",
	"count",
	"created_by",
	"data_group_id",
	"last_edited",
	"last_queried",
	"referenced_by",
	"referenced_directly_by",
	"active_integrations",
	"user",
	"customPropertyId",
	"canUpdateBasic",
	"referencedBy",
	"referencedDirectlyBy",
	"referencedRawEventProperties",
	"project",
	"is_shared_with_project",
	"template_type"
];