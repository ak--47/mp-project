module.exports.me = function (reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/me?include_workspace_users=false`;
};


module.exports.lexicon= function (project_id, workspace_id, entity = 'props', reg = `US`) {
	let url;
	switch (entity) {
		case 'props':
			url = `https://${gr(reg)}mixpanel.com/api/query/data_definitions/properties?includeCustom=false&project_id=${project_id}&resourceType=Event&workspace_id=${workspace_id}`;
			break;
		case 'events':
			url = `https://${gr(reg)}mixpanel.com/api/query/data_definitions/events?project_id=${project_id}&workspace_id=${workspace_id}`;
			break;
		case 'users':
			url = `https://${gr(reg)}mixpanel.com/api/query/data_definitions/properties?includeCustom=false&project_id=${project_id}&workspace_id=${workspace_id}&resourceType=User`;
			break;
		case 'groups':
			url = `https://${gr(reg)}mixpanel.com/api/query/data_definitions/properties?includeCustom=false&project_id=${project_id}&workspace_id=${workspace_id}&resourceType=Group`;
			break;
		default:
			console.error(`invalid entity type ${entity}`);
			break;
	}

	return url;
}

module.exports.projectMetaData = function (project_id, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/settings/project/${project_id}/metadata`;
};

module.exports.projectMetaAlso = function (project_id, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${project_id}/metadata`;
};

module.exports.projectLink = function (project_id, workspace_id, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/project/${project_id}/view/${workspace_id}/app/`;
};

module.exports.getAllDash = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/dashboards/`;
};

module.exports.getSingleDash = function (workSpaceId, dashId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/dashboards/${dashId}`;
};

module.exports.getSingleReport = function (workSpaceId, reportId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/bookmarks/${reportId}?v=2`;
};

module.exports.getSchemas = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/schemas`;
};

module.exports.postSchema = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/schemas`;
};

module.exports.makeDash = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/dashboards/`;
};

module.exports.createReport = function (workSpaceId, dashId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/dashboards/${dashId}`;
};

module.exports.shareDash = function (projectId, dashId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/shared-entities/dashboards/${dashId}/upsert`;
};

module.exports.pinDash = function (workSpaceId, dashId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/dashboards/${dashId}/pin/`;
};

module.exports.getCohorts = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/cohorts/`;
};

module.exports.createCohort = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/cohorts/`;
};

module.exports.shareCohort = function (projectId, cohortId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/shared-entities/cohorts/${cohortId}/upsert`;
};

module.exports.deleteCohorts = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/cohorts/bulk-delete/`;
};

module.exports.createCustomEvent = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/custom_events/`;
};



module.exports.getCustomEvents = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/custom_events`;
};


module.exports.delCustEvent = function (workspaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workspaceId}/data-definitions/events`;
};

module.exports.shareCustEvent = function (projectId, custEvId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/shared-entities/custom-events/${custEvId}/upsert`;
};

module.exports.shareCustProp = function (projectId, custPropId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/shared-entities/custom-properties/${custPropId}/upsert`;
};

module.exports.createCustomProp = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/custom_properties`;
};

module.exports.getCustomProps = function (workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/custom_properties`;
};

module.exports.dataDefinitions = function (resourceType, workSpaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/workspaces/${workSpaceId}/data-definitions/properties?resourceType=${resourceType}&includeCustom=true`;
};

module.exports.delCustProp = function (projectId, custPropId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/custom_properties/${custPropId}`;
};

module.exports.getMetaData = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/settings/project/${projectId}/metadata`;
};

module.exports.getInsightsReport = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/2.0/insights?project_id=${projectId}`;
};

module.exports.dataExport = function (start, end, reg = `US`) {
	return `https://data.${reg?.toLowerCase() === 'eu' ? "eu." : ""}mixpanel.com/api/2.0/export?from_date=${start}&to_date=${end}`;
};

module.exports.profileExport = function (projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/2.0/engage?project_id=${projectId}`;
};

module.exports.listCohorts = function (projectId, workspaceId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/2.0/cohorts/list?project_id=${projectId}&workspace_id=${workspaceId}`;
};

module.exports.makeFormula = function(projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/metrics`
}

module.exports.getFormulas = function(projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/metrics`
}

module.exports.getUsers  = function(projectId, reg = `US`) {
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/granted-users?include_invited_users=true&include_access_requests=true`
}

module.exports.saveTheme = function(projectId, reg = `US`) {	
	return `https://${gr(reg)}mixpanel.com/api/app/projects/${projectId}/themes`
}


function gr(reg = 'US') {
	return `${reg?.toLowerCase() === 'eu' ? "eu." : ""}`;
}
