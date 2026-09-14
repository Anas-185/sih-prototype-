import csv
from neo4j import GraphDatabase

# --- Verified AuraDB Configuration ---
URI = "neo4j+ssc://6c134cfd.databases.neo4j.io"
AUTH = ("6c134cfd", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")

ENTITIES_PATH = "structured_data_ingestion/data/output/final_structured_entities.csv"
RELATIONSHIPS_PATH = "structured_data_ingestion/data/output/final_structured_relationships.csv"

def load_graph():
    driver = GraphDatabase.driver(URI, auth=AUTH)

    with driver.session() as session:
        print("Clearing old data...")
        session.run("MATCH (n) DETACH DELETE n")

        print(f"Loading entities from {ENTITIES_PATH}...")
        with open(ENTITIES_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count_nodes = 0
            for row in reader:
                entity_type = row.get("entity_type", "Entity").strip().upper()
                query = f"""
                MERGE (n:{entity_type} {{entity_id: $id}})
                SET n.name = $name,
                    n.normalized_name = $normalized_name,
                    n.aliases = $aliases,
                    n.source_record = $source_record,
                    n.confidence = $confidence
                """
                session.run(
                    query,
                    id=row.get("entity_id"),
                    name=row.get("name"),
                    normalized_name=row.get("normalized_name", row.get("name")),
                    aliases=row.get("aliases", ""),
                    source_record=row.get("source_record", ""),
                    confidence=row.get("confidence", "1.0"),
                )
                count_nodes += 1
            print(f"Loaded {count_nodes} entities.")

        print(f"Loading relationships from {RELATIONSHIPS_PATH}...")
        with open(RELATIONSHIPS_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count_edges = 0
            for row in reader:
                rel_type = row.get("relationship_type", "ASSOCIATED_WITH").strip().upper()
                query = f"""
                MATCH (s {{entity_id: $source_id}})
                MATCH (t {{entity_id: $target_id}})
                MERGE (s)-[r:{rel_type}]->(t)
                SET r.relationship_id = $rel_id,
                    r.date = $date,
                    r.confidence = $confidence
                """
                session.run(
                    query,
                    source_id=row.get("source_id"),
                    target_id=row.get("target_id"),
                    rel_id=row.get("relationship_id", ""),
                    date=row.get("date", ""),
                    confidence=row.get("confidence", "1.0"),
                )
                count_edges += 1
            print(f"Loaded {count_edges} relationships.")

    driver.close()
    print("Database loaded successfully!")

if __name__ == "__main__":
    load_graph()