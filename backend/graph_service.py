import os
from neo4j import GraphDatabase

URI = os.getenv("NEO4J_URI", "neo4j+ssc://6c134cfd.databases.neo4j.io")
AUTH = (
    os.getenv("NEO4J_USERNAME", "6c134cfd"),
    os.getenv("NEO4J_PASSWORD", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8"),
)

def get_driver():
    return GraphDatabase.driver(URI, auth=AUTH)

# --- FEATURE 1: ENTITY SEARCH & RESOLUTION ---
def search_entity(query_text):
    """Search entity by name or ID."""
    query = """
    MATCH (n:Entity)
    WHERE toLower(n.name) CONTAINS toLower($q) 
       OR toLower(n.id) CONTAINS toLower($q)
       OR toLower(coalesce(n.entity_id, '')) CONTAINS toLower($q)
    RETURN n.id AS id, coalesce(n.type, labels(n)[0]) AS type, n.name AS name
    LIMIT 20
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, q=query_text)
            return [dict(record) for record in results]

# --- FEATURE 2: GRAPH CONSTRUCTION & VISUALIZATION ---
def get_full_graph(limit=150):
    """Return nodes and edges formatted for visualizers (PyVis, D3, streamlit-agraph)."""
    query = """
    MATCH (s:Entity)-[r:CONNECTED_TO]->(t:Entity)
    RETURN s.id AS source, coalesce(s.type, 'Entity') AS source_type, s.name AS source_name,
           coalesce(r.type, type(r)) AS rel_type,
           t.id AS target, coalesce(t.type, 'Entity') AS target_type, t.name AS target_name
    LIMIT $limit
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, limit=limit)
            nodes = {}
            edges = []
            for row in results:
                nodes[row["source"]] = {
                    "id": row["source"],
                    "label": row["source_name"] or row["source"],
                    "type": row["source_type"]
                }
                nodes[row["target"]] = {
                    "id": row["target"],
                    "label": row["target_name"] or row["target"],
                    "type": row["target_type"]
                }
                edges.append({
                    "source": row["source"],
                    "target": row["target"],
                    "label": row["rel_type"]
                })
            return list(nodes.values()), edges

def get_node_details(entity_id):
    """Fetch all metadata properties for an inspector/sidebar view."""
    query = """
    MATCH (n:Entity)
    WHERE n.id = $id OR n.entity_id = $id
    RETURN properties(n) AS details, coalesce(n.type, labels(n)[0]) AS type
    LIMIT 1
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id=str(entity_id)).single()
            return dict(record) if record else None

# --- FEATURE 3: SHORTEST PATH & CONNECTION FINDER ---
def find_shortest_path(id1, id2):
    """Find the connection path between two entities."""
    query = """
    MATCH (p1:Entity), (p2:Entity)
    WHERE (p1.id = $id1 OR p1.entity_id = $id1)
      AND (p2.id = $id2 OR p2.entity_id = $id2)
    MATCH path = shortestPath((p1)-[:CONNECTED_TO*..5]-(p2))
    RETURN [node in nodes(path) | {id: node.id, label: node.name, type: node.type}] AS path_nodes,
           [rel in relationships(path) | coalesce(rel.type, type(rel))] AS path_rels
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id1=str(id1), id2=str(id2)).single()
            return dict(record) if record else None

# --- FEATURE 4: KINGPIN / CENTRALITY IDENTIFICATION ---
def get_top_influencers(limit=5):
    """Identifies syndicate leaders/brokers by degree centrality."""
    query = """
    MATCH (e:Entity)-[r:CONNECTED_TO]-()
    RETURN e.id AS id, e.name AS name, coalesce(e.type, 'Entity') AS type, count(r) AS degree_centrality
    ORDER BY degree_centrality DESC
    LIMIT $limit
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, limit=limit)
            return [dict(record) for record in results]

# --- FEATURE 5: SUB-GANG / COMMUNITY DETECTION ---
def detect_sub_gangs(limit=5):
    """Finds interconnected clusters and key intermediate sub-gang leaders."""
    query = """
    MATCH (e:Entity {type: 'PERSON'})-[:CONNECTED_TO]-(associate:Entity {type: 'PERSON'})
    WITH e, collect(DISTINCT associate.name) AS gang_members, count(DISTINCT associate) AS cell_size
    WHERE cell_size > 1
    RETURN e.id AS leader_id, e.name AS hub_leader, cell_size, gang_members
    ORDER BY cell_size DESC
    LIMIT $limit
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, limit=limit)
            return [dict(record) for record in results]