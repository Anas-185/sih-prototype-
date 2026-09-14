from neo4j import GraphDatabase

URI = "neo4j+ssc://6c134cfd.databases.neo4j.io"
AUTH = ("6c134cfd", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")

def get_driver():
    return GraphDatabase.driver(URI, auth=AUTH)

def search_entity(query_text):
    """Search entity by name or entity_id."""
    query = """
    MATCH (n)
    WHERE toLower(n.name) CONTAINS toLower($q) 
       OR toLower(n.entity_id) CONTAINS toLower($q)
       OR toLower(n.normalized_name) CONTAINS toLower($q)
    RETURN n.entity_id AS id, labels(n)[0] AS type, n.name AS name, n.normalized_name AS normalized
    LIMIT 20
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, q=query_text)
            return [dict(record) for record in results]

def get_full_graph(limit=100):
    """Return nodes and edges formatted for visualizers like streamlit-agraph or pyvis."""
    query = """
    MATCH (s)-[r]->(t)
    RETURN s.entity_id AS source, labels(s)[0] AS source_type, s.name AS source_name,
           type(r) AS rel_type,
           t.entity_id AS target, labels(t)[0] AS target_type, t.name AS target_name
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
    MATCH (n {entity_id: $id})
    RETURN properties(n) AS details, labels(n)[0] AS type
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id=entity_id).single()
            return dict(record) if record else None

def find_shortest_path(id1, id2):
    """Find the connection path between two entities."""
    query = """
    MATCH (p1 {entity_id: $id1}), (p2 {entity_id: $id2})
    MATCH path = shortestPath((p1)-[*..5]-(p2))
    RETURN [node in nodes(path) | {id: node.entity_id, label: node.name, type: labels(node)[0]}] AS path_nodes,
           [rel in relationships(path) | type(rel)] AS path_rels
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id1=id1, id2=id2).single()
            return dict(record) if record else None