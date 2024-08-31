require('dotenv').config();
const axios = require('axios');
const duckdb = require('duckdb');
const readline = require('readline');
let { NODE_ENV = "unknown", api_secret = ""  } = process.env;


// Initialize DuckDB and create an in-memory database
const db = new duckdb.Database(':memory:');
const conn = db.connect();

// Create a table in DuckDB to store the event data
conn.run(`
    CREATE TABLE events (
        event VARCHAR NOT NULL,
        time VARCHAR,
        distinct_id VARCHAR,
        user_id VARCHAR,
        device_id VARCHAR,
        insert_id VARCHAR,
     	props VARCHAR -- Store JSON as a string
    );
`, (err) => {
	if (err) {
		console.error('Error creating table:', err);
		return;
	}
	console.log('Table created successfully!');
});


// Function to insert data into DuckDB
// Function to insert data into DuckDB using prepared statements
function insertIntoDuckDB(row) {

	// Convert properties object to JSON string and ensure each value is defined
	const props = {}; //JSON.stringify(row.props || {});
	const event = row.event || 'X';
	const time = new Date(row.time * 1000).toISOString() || new Date().toISOString();
	const distinct_id = row.distinct_id || 'X';
	const user_id = row.$user_id || "X";
	const device_id = row.$device_id || "X";
	const insert_id = row.$insert_id || "X"; // Ensure insert_id is included



	const query = `
	INSERT INTO events (event, time, distinct_id, user_id, device_id, insert_id, props)
	VALUES ('${event}', '${time}', '${distinct_id}', '${user_id}', '${device_id}', '${insert_id}', '${props}');
		`;


	// Prepare the statement
	const stmt = conn.prepare(query);

	// Run the prepared statement
	stmt.run((err) => {
		if (err) {
			if (process.env.NODE_ENV === "dev") debugger;
			console.error('Error inserting data:', err);
			// Optionally include more detailed debugging information
			console.error('Query:', query);
			console.error('Values:', values);
		}
	});

	// Finalize the statement
	stmt.finalize();
}

// Function to run continuous queries on the data
function runContinuousQuery() {
	const query = `
        SELECT event, COUNT(*) AS event_count
        FROM events
        GROUP BY event;
    `;
	conn.all(query, (err, result) => {
		if (err) {
			console.error('Error running query:', err);
		} else {
			console.log('Continuous Query Result:', result);
		}

		// Schedule the next query run
		setTimeout(runContinuousQuery, 5000);  // Run the query every 5 seconds
	});
}

// Start running the continuous query
runContinuousQuery();

// Function to handle the data stream
function handleDataStream(stream) {
	const rl = readline.createInterface({
		input: stream,
		crlfDelay: Infinity
	});

	rl.on('line', (line) => {
		try {
			const e = JSON.parse(line);
			const {
				time: time = 0,
				distinct_id: distinct_id = "",
				user_id: $user_id = "",
				device_id: $device_id = "",
				insert_id: $insert_id = "",
				...props
			} = e.properties || {};
			const event = e.event;
			const row = { event, time, distinct_id, $user_id, $device_id, $insert_id, props };

			insertIntoDuckDB(row);
		} catch (err) {
			console.error('Error parsing JSON:', err);
		}
	});

	rl.on('close', () => {
		console.log('Stream closed.');
	});
}

// Start the streaming process
axios({
	method: 'GET',
	url: 'https://data.mixpanel.com/api/2.0/export',
	params: {
		from_date: '2024-08-24',
		to_date: '2024-08-25',
	},
	responseType: 'stream',

	headers: {
		"Authorization": "Basic " + Buffer.from(`${api_secret}: `).toString('base64'),
		"Accept": "text/plain"
	}
})
	.then((response) => {
		handleDataStream(response.data);
	})
	.catch((error) => {
		console.error('Error fetching data from API:', error);
	});

