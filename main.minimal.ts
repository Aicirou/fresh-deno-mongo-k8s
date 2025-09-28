// Minimalist Deno HTTP server

interface ApiResponse {
  message: string;
  timestamp: string;
  data?: unknown;
}

// Simple in-memory data store
const dinosaurs = [
  { id: 1, name: "T-Rex", period: "Cretaceous", diet: "Carnivore" },
  { id: 2, name: "Triceratops", period: "Cretaceous", diet: "Herbivore" },
  { id: 3, name: "Velociraptor", period: "Cretaceous", diet: "Carnivore" },
  { id: 4, name: "Brontosaurus", period: "Jurassic", diet: "Herbivore" },
];

// Routes handler
function handleRequest(req: Request): Response {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // API Routes
  if (path === "/health") {
    const response: ApiResponse = {
      message: "🦕 Dinosaur API is healthy!",
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 
        "content-type": "application/json",
        ...corsHeaders 
      },
    });
  }

  if (path === "/api/dinosaurs") {
    const response: ApiResponse = {
      message: "Dinosaurs retrieved successfully",
      timestamp: new Date().toISOString(),
      data: dinosaurs,
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 
        "content-type": "application/json",
        ...corsHeaders 
      },
    });
  }

  if (path.startsWith("/api/dinosaurs/")) {
    const id = parseInt(path.split("/")[3]);
    const dinosaur = dinosaurs.find(d => d.id === id);
    
    if (!dinosaur) {
      return new Response(JSON.stringify({ 
        message: "Dinosaur not found",
        timestamp: new Date().toISOString() 
      }), {
        status: 404,
        headers: { 
          "content-type": "application/json",
          ...corsHeaders 
        },
      });
    }

    const response: ApiResponse = {
      message: "Dinosaur retrieved successfully",
      timestamp: new Date().toISOString(),
      data: dinosaur,
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 
        "content-type": "application/json",
        ...corsHeaders 
      },
    });
  }

  // Serve static files
  if (path === "/" || path === "/index.html") {
    return new Response(getIndexHtml(), {
      headers: { 
        "content-type": "text/html",
        ...corsHeaders 
      },
    });
  }

  // Default 404
  return new Response("Not Found", { 
    status: 404,
    headers: corsHeaders 
  });
}

// Simple HTML page
function getIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🦕 Dinosaur API</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { text-align: center; margin-bottom: 30px; }
        .api-section { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 10px; 
        }
        .dinosaur-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; 
            margin-top: 20px; 
        }
        .dinosaur-card { 
            background: rgba(255,255,255,0.2); 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center;
        }
        button { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
        }
        button:hover { background: #45a049; }
        .endpoint { 
            background: rgba(0,0,0,0.2); 
            padding: 10px; 
            border-radius: 5px; 
            font-family: monospace; 
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦕 Dinosaur API</h1>
        
        <div class="api-section">
            <h3>Available Endpoints:</h3>
            <div class="endpoint">GET /health - Health check</div>
            <div class="endpoint">GET /api/dinosaurs - Get all dinosaurs</div>
            <div class="endpoint">GET /api/dinosaurs/{id} - Get specific dinosaur</div>
        </div>

        <div class="api-section">
            <h3>Quick Actions:</h3>
            <button onclick="testHealth()">Test Health</button>
            <button onclick="loadDinosaurs()">Load Dinosaurs</button>
            <div id="results" style="margin-top: 20px;"></div>
        </div>

        <div id="dinosaur-display" class="dinosaur-list"></div>
    </div>

    <script>
        async function testHealth() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                document.getElementById('results').innerHTML = 
                    '<pre style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 5px; overflow-x: auto;">' + 
                    JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('results').innerHTML = 
                    '<div style="color: #ff6b6b;">Error: ' + error.message + '</div>';
            }
        }

        async function loadDinosaurs() {
            try {
                const response = await fetch('/api/dinosaurs');
                const result = await response.json();
                
                document.getElementById('results').innerHTML = 
                    '<pre style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 5px; overflow-x: auto;">' + 
                    JSON.stringify(result, null, 2) + '</pre>';
                
                // Display dinosaurs in cards
                const dinosaursHtml = result.data.map(dino => 
                    '<div class="dinosaur-card">' +
                    '<h4>' + dino.name + '</h4>' +
                    '<p><strong>Period:</strong> ' + dino.period + '</p>' +
                    '<p><strong>Diet:</strong> ' + dino.diet + '</p>' +
                    '</div>'
                ).join('');
                
                document.getElementById('dinosaur-display').innerHTML = dinosaursHtml;
            } catch (error) {
                document.getElementById('results').innerHTML = 
                    '<div style="color: #ff6b6b;">Error: ' + error.message + '</div>';
            }
        }

        // Load dinosaurs on page load
        loadDinosaurs();
    </script>
</body>
</html>`;
}

// Start server
if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "8000");
  
  console.log(`🦕 Starting Dinosaur API on http://localhost:${port}`);
  
  Deno.serve({ port }, handleRequest);
}
