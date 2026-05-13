import json

def compare_json(file1, file2):
    with open(file1, 'r', encoding='utf-8') as f1, open(file2, 'r', encoding='utf-8') as f2:
        d1 = json.load(f1)
        d2 = json.load(f2)
        
    print(f"Comparing nodes in {file1} (user) vs {file2} (local)")
    
    nodes1 = {n['name']: n for n in d1['nodes']}
    nodes2 = {n['name']: n for n in d2['nodes']}
    
    all_names = set(nodes1.keys()) | set(nodes2.keys())
    for name in all_names:
        if name not in nodes1:
            print(f"[{name}] Only in LOCAL")
            continue
        if name not in nodes2:
            print(f"[{name}] Only in USER")
            continue
            
        n1 = nodes1[name]
        n2 = nodes2[name]
        
        # compare parameters
        if n1.get('parameters') != n2.get('parameters'):
            print(f"\nDifferences in node: {name}")
            print("USER parameters:")
            print(json.dumps(n1.get('parameters'), indent=2))
            print("LOCAL parameters:")
            print(json.dumps(n2.get('parameters'), indent=2))

    print("\nComparing connections...")
    c1 = d1.get('connections', {})
    c2 = d2.get('connections', {})
    if c1 != c2:
        print("Connections differ!")
        # We can do a deep diff if needed, for now just note they differ

compare_json('user.json', 'Agente Unificado/Sync_CRM.json')
