import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from backend.graph_service import (
    search_entity,
    get_full_graph,
    get_node_details,
    get_resolved_entities,
    find_shortest_path,
)

app = FastAPI(
    title="Forensic Criminal Network Intelligence API",
    description="Backend API exposing Neo4j graph analytics, threat scoring, and entity resolution.",
    version="1.0.0",
)

# Enable CORS for frontend connectivity (React / Vite / Next.js default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "online",
        "service": "Forensic Network Intelligence API",
        "version": "1.0.0",
        "endpoints": [
            "/api/graph",
            "/api/search",
            "/api/node/{entity_id}",
            "/api/entity-resolution",
            "/api/path",
        ],
    }


# ============================================================================
# FEATURE 1: MULTI-PIVOT ENTITY SEARCH
# ============================================================================
@app.get("/api/search")
def search_entities(
    term: str = Query(..., min_length=1, description="Name, alias, phone, ID, or crime category"),
    limit: int = Query(20, ge=1, le=100, description="Max search results to return"),
):
    """Search suspects, locations, and crimes across multiple forensic markers."""
    try:
        results = search_entity(term, limit=limit)
        return {"query": term, "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# ============================================================================
# FEATURE 2: INTERACTIVE RISK-WEIGHTED TOPOLOGY
# ============================================================================
@app.get("/api/graph")
def get_graph(
    limit: int = Query(200, ge=1, le=1000, description="Max edge traversals to fetch"),
):
    """Retrieve full visual network topology with dynamic node scaling and risk weights."""
    try:
        nodes, edges = get_full_graph(limit=limit)
        return {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "nodes": nodes,
            "edges": edges,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph retrieval failed: {str(e)}")


# ============================================================================
# FEATURE 3: NODE INSPECTOR & COMPUTED THREAT INDEX
# ============================================================================
@app.get("/api/node/{entity_id}")
def get_node(entity_id: str):
    """Retrieve deep profile dossier, crime history, and automated 0-100 Threat Index."""
    try:
        details = get_node_details(entity_id)
        if not details:
            raise HTTPException(
                status_code=404,
                detail=f"Entity with ID '{entity_id}' not found in database",
            )
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Node lookup failed: {str(e)}")


# ============================================================================
# FEATURE 4: ENTITY RESOLUTION & MERGE AUDIT
# ============================================================================
@app.get("/api/entity-resolution")
def get_entity_resolutions(
    limit: int = Query(25, ge=1, le=200, description="Max resolved clusters to audit"),
):
    """Inspect resolved master entities, deduplicated aliases, and confidence scores."""
    try:
        resolutions = get_resolved_entities(limit=limit)
        return {"count": len(resolutions), "resolved_entities": resolutions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity resolution audit failed: {str(e)}")


# ============================================================================
# FEATURE 5: SHORTEST PATH & CRITICAL BOTTLENECK FINDER
# ============================================================================
@app.get("/api/path")
def trace_path(
    source: str = Query(..., description="Source entity ID"),
    target: str = Query(..., description="Target entity ID"),
):
    """Calculate shortest association path between two entities and flag critical intermediary bridges."""
    try:
        path_result = find_shortest_path(source, target)
        if not path_result:
            return {
                "source": source,
                "target": target,
                "found": False,
                "message": "No direct or indirect relationship chain found within traversal limits.",
            }
        return {"source": source, "target": target, "found": True, "path": path_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Path discovery failed: {str(e)}")
    