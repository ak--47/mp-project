const dayjs = require('dayjs');
const insightsTemplate = require('./insightsTemplate.json');
const funnelsTemplate = require('./funnelsTemplate.json');
const flowsTemplate = require('./flowsTemplate.json');
const retentionTemplate = require('./retentionTemplate.json');


module.exports.setTheme = function (colors, name) {
	if (!colors) colors = ["#6AFF57", "#57443F", "#3B7974", "#826018", "#731128", "#3B586C", "#593419", "#0D7EA0", "#1A804F", "#BB4434", "#070208", "#05433E"];
	const payload = {
		"type": "categorical",
		"name": name,
		"data": {
			"colors": colors,
		},
		"global_access_type": "editor"
	};

	return payload;
};


module.exports.createDash = function (name, description) {

};

/**
 * @typedef {Object} SimplePayload
 * @property {string} [from] - The start date in ISO format.
 * @property {string} [to] - The end date in ISO format.
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
 * @param  {string} name
 * @param  {string} desc
 * @param  {number} dash
 * @param  {SimplePayload} simplePayload
 * @param  {'insights' | 'funnels' | 'flows' | 'retention'} type
 */
module.exports.createReport = function (name, desc, dash, simplePayload = {}, type = "insights") {
	const { from = dayjs().subtract(30, 'd').toISOString(), to = dayjs().toISOString(), days = 0, shape = "line", breakdowns = [], blocks = [{ ev: "$all_events", maths: "total" }] } = simplePayload;
	let template;
	switch (type) {
		case "insights":
			template = 'foo';
			break;
		case "funnels":
			template = 'bar';
			break;
		case "flows":
			template = 'baz';
			break;
		case "retention":
			template = 'qux';
			break;
		default:
			throw new Error(`type ${type} is invalid type; must be one of 'insights', 'funnels', 'flows', or 'retention'`);
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
};



{
	"content": {
		"action": "create",
			"content_type": "report",
				"content_params": {
			"bookmark": {
				"type": "insights",
					"name": "Untitled",
						"description": "",
							"dashboard_id": 7351229,
								"params": { }
			}
		}
	}
}

// layout payload
const layout = { "layout": { "rows": [{ "height": 0, "cells": [{ "id": "fEGqmELw", "width": 6 }, { "id": "dQ32tc8d", "width": 6 }], "id": "TUvsEPn4" }, { "height": 0, "cells": [], "id": "qATtSFxj" }], "rows_order": ["TUvsEPn4", "bTJDNg75", "qATtSFxj"] } };

// blacklisted keys
module.exports.blacklistKeys = [
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