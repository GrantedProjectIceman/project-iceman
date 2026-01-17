"""
Upload grants data from JSONL files to Firebase Firestore.

Usage:
    python backend/upload_grants_to_firebase.py grants_features.jsonl
    python backend/upload_grants_to_firebase.py grants_features.jsonl --limit 10
    python backend/upload_grants_to_firebase.py grants_features.jsonl --dry-run
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from firebase_init import db


def read_jsonl(path: str):
    """Read JSONL file line by line."""
    with open(path, 'r', encoding='utf-8') as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                print(f"[ERROR] Line {line_no}: {e}", file=sys.stderr)
                continue


def extract_grant_id(grant: dict) -> str:
    """
    Extract unique grant ID from source_url or fallback to title.
    Example: https://oursggrants.gov.sg/grants/aicccmda/instruction -> aicccmda
    """
    url = grant.get("source_url", "")
    
    # Extract from URL pattern: /grants/<id>/instruction
    import re
    match = re.search(r"/grants/([^/]+)(/instruction)?", url)
    if match:
        return match.group(1)
    
    # Fallback to sanitized title
    title = grant.get("title", "unknown")
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:50]


def prepare_grant_document(grant: dict) -> dict:
    """
    Prepare grant data for Firestore.
    Clean up and structure the data appropriately.
    """
    doc = {
        # Core fields
        "source": grant.get("source", "oursggrants"),
        "source_url": grant.get("source_url"),
        "title": grant.get("title"),
        "agency": grant.get("agency"),
        
        # Description fields
        "about": grant.get("about"),
        "who_can_apply": grant.get("who_can_apply"),
        "when_to_apply": grant.get("when_to_apply"),
        "funding": grant.get("funding"),
        "how_to_apply": grant.get("how_to_apply"),
        
        # Structured data
        "grant_profile": grant.get("grant_profile", {}),
        "features": grant.get("features", {}),
        "sections": grant.get("sections", []),
        "others": grant.get("others", []),
        "documents_required": grant.get("documents_required", []),
        
        # Metadata
        "metadata": grant.get("metadata", {}),
        "uploaded_at": datetime.utcnow().isoformat(),
    }
    
    return {k: v for k, v in doc.items() if v is not None}


def upload_grants(
    jsonl_path: str,
    collection_name: str = "grants",
    dry_run: bool = False,
    limit: int = None
):
    """
    Upload grants from JSONL file to Firestore.
    
    Args:
        jsonl_path: Path to JSONL file with grant data
        collection_name: Firestore collection name (default: "grants")
        dry_run: If True, only simulate without actually uploading
        limit: Maximum number of grants to upload (for testing)
    """
    if dry_run:
        print("[DRY RUN] Simulating upload without writing to Firestore")
        collection = None
    else:
        collection = db.collection(collection_name)
    
    stats = {
        "processed": 0,
        "uploaded": 0,
        "errors": 0,
        "skipped": 0
    }
    
    for grant in read_jsonl(jsonl_path):
        stats["processed"] += 1
        
        if limit and stats["processed"] > limit:
            print(f"\n[LIMIT] Reached limit of {limit} grants")
            break
        
        try:
            grant_id = extract_grant_id(grant)
            doc_data = prepare_grant_document(grant)
            
            title = doc_data.get("title", "Untitled")[:60]
            
            if dry_run:
                print(f"[{stats['processed']}] Would upload: {grant_id} - {title}")
                stats["uploaded"] += 1
            else:
                # Upload to Firestore
                collection.document(grant_id).set(doc_data)
                print(f"[{stats['processed']}] ✓ Uploaded: {grant_id} - {title}")
                stats["uploaded"] += 1
                
        except Exception as e:
            print(f"[{stats['processed']}] ✗ Error: {e}", file=sys.stderr)
            stats["errors"] += 1
            continue
    
    print("\n" + "="*60)
    print("UPLOAD SUMMARY")
    print("="*60)
    print(f"Processed:  {stats['processed']}")
    print(f"Uploaded:   {stats['uploaded']}")
    print(f"Errors:     {stats['errors']}")
    print(f"Skipped:    {stats['skipped']}")
    print("="*60)
    
    if dry_run:
        print("\n[DRY RUN] No data was actually uploaded to Firebase")
    else:
        print(f"\n✓ Successfully uploaded to Firestore collection: {collection_name}")


def upload_facets(facets_path: str, dry_run: bool = False):
    """
    Upload facets.json as a single metadata document.
    This is useful for quick filtering options in your frontend.
    """
    with open(facets_path, 'r', encoding='utf-8') as f:
        facets = json.load(f)
    
    if dry_run:
        print("[DRY RUN] Would upload facets metadata")
        print(json.dumps(facets, indent=2))
        return
    
    from firebase_init import db
    
    db.collection("metadata").document("facets").set({
        "facets": facets,
        "updated_at": datetime.utcnow().isoformat()
    })
    print("✓ Uploaded facets metadata")


def main():
    parser = argparse.ArgumentParser(
        description="Upload grants data to Firebase Firestore"
    )
    parser.add_argument(
        "jsonl_file",
        help="Path to JSONL file (e.g., grants_features.jsonl)"
    )
    parser.add_argument(
        "--collection",
        default="grants",
        help="Firestore collection name (default: grants)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate upload without writing to Firestore"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Only upload first N grants (for testing)"
    )
    parser.add_argument(
        "--facets",
        help="Also upload facets.json file"
    )
    
    args = parser.parse_args()
    
    if not Path(args.jsonl_file).exists():
        print(f"Error: File not found: {args.jsonl_file}", file=sys.stderr)
        sys.exit(1)
    
    upload_grants(
        args.jsonl_file,
        collection_name=args.collection,
        dry_run=args.dry_run,
        limit=args.limit
    )
    
    if args.facets:
        if not Path(args.facets).exists():
            print(f"Warning: Facets file not found: {args.facets}", file=sys.stderr)
        else:
            upload_facets(args.facets, dry_run=args.dry_run)


if __name__ == "__main__":
    main()