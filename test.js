
const path = require('path');
const MixpanelProject = require('./index.js');
const writePath = path.resolve('./tmp');
const os = require('os');
const fs = require('fs');
const v8 = require('v8');
const { execSync } = require('child_process');

const {
	access_token,
	service_acct,
	service_secret,
	id,
} = process.env;

if (!access_token || !service_acct || !service_secret || !id) {
	throw new Error('Please set the following environment variables: access_token, service_acct, service_secret, id');
}

beforeAll(() => {
	execSync(`npm run prune`);
});

afterAll(() => {
	execSync(`npm run prune`);
});

test('do tests work', async () => {
	expect(true).toBe(true);
});
