import os
from neo4j import GraphDatabase

# Neo4j AuraDB Connection Config
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+ssc://6c134cfd.databases.neo4j.io")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "6c134cfd")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

def search_entity(search_term):
    query = """
    MATCH (n:Entity)
    WHERE toLower(n.name) CONTAINS toLower($term) OR toLower(n.id) CONTAINS toLower($term)
    RETURN n.id AS id, n.name AS name, n.type AS type
    LIMIT 3
    """
    with driver.session() as session:
        result = session.run(query, term=str(search_term))
        return [record.data() for record in result]

def get_full_graph():
    query = """
    MATCH (n)-[r:CONNECTED_TO]->(m)
    RETURN n.id AS source, type(r) AS rel, m.id AS target
    LIMIT 3
    """
    with driver.session() as session:
        result = session.run(query)
        return [record.data() for record in result]

def get_node_details(node_id):
    query = """
    MATCH (n:Entity {id: $id})
    RETURN properties(n) AS details
    """
    with driver.session() as session:
        result = session.run(query, id=str(node_id))
        record = result.single()
        return record.data() if record else None

def find_shortest_path(source_id, target_id):
    query = """
    MATCH p=shortestPath((a:Entity {id: $src})-[:CONNECTED_TO*..5]-(b:Entity {id: $tgt}))
    RETURN [n in nodes(p) | n.id] AS path
    """
    with driver.session() as session:
        result = session.run(query, src=str(source_id), tgt=str(target_id))
        record = result.single()
        return record.data() if record else None

def run_tests():
    print("Testing connection to Neo4j AuraDB...")
    try:
        driver.verify_connectivity()
        print("✓ SUCCESS: Connected to AuraDB instance.")
        
        print("\n--- Testing API Functions ---")
        
        print("\n1. Testing get_full_graph() (Fetching 3 edges):")
        graph_sample = get_full_graph()
        for edge in graph_sample:
            print(f"   {edge}")
            
        print("\n2. Testing search_entity() (Searching for '1'):")
        search_results = search_entity('1')
        for res in search_results:
            print(f"   {res}")
            
        if search_results:
            sample_id = search_results[0]['id']
            print(f"\n3. Testing get_node_details() for Node '{sample_id}':")
            details = get_node_details(sample_id)
            print(f"   {details}")
            
        if len(graph_sample) >= 1:
            src = graph_sample[0]['source']
            tgt = graph_sample[0]['target']
            print(f"\n4. Testing find_shortest_path() between '{src}' and '{tgt}':")
            path = find_shortest_path(src, tgt)
            print(f"   {path}")

        print("\n✓ Backend API Query Test Complete.")
        
    except Exception as e:
        print(f"\n! FAILED to connect or execute queries. Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    run_tests()