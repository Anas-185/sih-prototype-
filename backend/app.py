from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from neo4j import GraphDatabase

app = FastAPI(title="SIH Prototype API", version="1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded AuraDB Connection Configuration
NEO4J_URI = "neo4j+ssc://6c134cfd.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "YOUR_ACTUAL_PASSWORD_HERE" # Replace with your password

# Now place your temporary UI route here:
@app.get("/", response_class=HTMLResponse)
async def temporary_ui():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SIH Prototype Quick Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 50px; background: #f4f4f9; color: #333; }
            .container { max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            input { width: 70%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; }
            button { padding: 10px 20px; font-size: 16px; background: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            pre { background: #eee; padding: 15px; border-radius: 4px; overflow-x: auto; max-height: 300px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>SIH Prototype Quick Test UI</h2>
            <p>Test your Neo4j backend data instantly:</p>
            <input type="text" id="searchTerm" value="C017" placeholder="Enter node ID (e.g., C017)">
            <button onclick="testSearch()">Search</button>
            <h3>Result:</h3>
            <pre id="output">Click search to test API response...</pre>
        </div>
        <script>
            async function testSearch() {
                const term = document.getElementById('searchTerm').value;
                const output = document.getElementById('output');
                output.innerText = "Loading...";
                try {
                    const response = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
                    const data = await response.json();
                    output.innerText = JSON.stringify(data, null, 2);
                } catch (err) {
                    output.innerText = "Error: " + err;
                }
            }
        </script>
    </body>
    </html>
    """
