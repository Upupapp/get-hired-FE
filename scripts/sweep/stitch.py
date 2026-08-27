import re, os, sys
# FE->BE endpoint reconciliation. Resolves base-URL variables transitively (the app
# uses two transports: HttpClient directly AND BaseService) and compares every
# resolved call path against routes/*.js, accounting for server.js's sub-router
# mounts. Point BE at the get-hired-BE checkout; defaults to a sibling directory.
FE=os.environ.get('GH_FE', os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BE=os.environ.get('GH_BE', os.path.join(os.path.dirname(FE),'get-hired-BE'))
S=os.environ.get('GH_SWEEP_OUT', os.path.dirname(os.path.abspath(__file__)))
def strip(t):
    t=re.sub(r'/\*.*?\*/','',t,flags=re.S)
    return re.sub(r'^\s*//.*$','',t,flags=re.M)
basemap={}
for root,_,fs in os.walk(FE+'/src/app'):
    for fn in fs:
        if not fn.endswith('.ts'): continue
        p=os.path.relpath(os.path.join(root,fn), FE)
        t=strip(open(os.path.join(root,fn),encoding='utf-8',errors='replace').read())
        m={}
        for name,expr in re.findall(r'(?:private\s+|public\s+|readonly\s+)*(\w+)\s*(?::\s*string\s*)?=\s*([^;\n]+)',t):
            m.setdefault(name,expr.strip())
        basemap[p]=m
API='\x00'
def resolve(path, expr, d=0):
    if d>8: return expr
    e=expr.replace('${environment.api_url}',API).replace('environment.api_url +',API).replace("environment.api_url+",API)
    e=e.replace('environment.api_url',API)
    if e.startswith(API): return e[len(API):]
    mm=re.match(r'^\$\{this\.(\w+)\}(.*)$', e)
    if not mm: return e
    var,rest=mm.groups()
    val=basemap.get(path,{}).get(var)
    if val is None: return '<?%s?>%s'%(var,rest)
    val=val.strip().rstrip(';').strip()
    if val.startswith('`') and val.endswith('`'): val=val[1:-1]
    elif val.startswith("'") and val.endswith("'"): val=val[1:-1]
    elif val.startswith('"') and val.endswith('"'): val=val[1:-1]
    if 'environment.server' in val: return 'SERVER:'+rest
    return resolve(path, val+rest, d+1)
# Both transports must be scanned. Only ~30% of calls use HttpClient directly;
# the rest go through BaseService, and a census that greps `http.get(` alone
# silently misses two thirds of the surface.
DIRECT=re.compile(r'http\.(?:get|post|put|patch|delete)(?:<[^>]*>)?\(\s*[`"\']([^`"\']*)')
WRAPPED=re.compile(r'(?:baseService|base|api|apiService|_base)\.(?:get|post|put|patch|delete|request)(?:<[^>]*>)?\(\s*[`"\']([^`"\']*)')
calls=[]
for root,_,fs in os.walk(FE+'/src/app'):
    for fn in fs:
        if not fn.endswith('.ts') or fn.endswith('.spec.ts'): continue
        rel=os.path.relpath(os.path.join(root,fn),FE)
        t=strip(open(os.path.join(root,fn),encoding='utf-8',errors='replace').read())
        for rx in (DIRECT,WRAPPED):
            for expr in rx.findall(t):
                calls.append((rel,expr,resolve(rel,expr)))
# server.js mounts most routers at /api but a few at a deeper prefix
# (/api/images, /api/search). Router files declare paths relative to their own
# mount, so the prefix MUST be applied or those calls read as orphans.
srv=strip(open(BE+'/server.js',encoding='utf-8',errors='replace').read())
mounts={}   # module identifier -> prefix below /api ('' for a bare /api mount)
for pref,mod in re.findall(r'app\.use\(\s*["\']/api([^"\']*)["\']\s*,\s*(\w+)\s*\)', srv):
    mounts[mod]=pref.rstrip('/')
# module identifier -> routes file, via the import statements in server.js
srcof={}
for mod,rel in re.findall(r'import\s+(\w+)\s+from\s+["\']\.?/?(routes/[\w./-]+)["\']', srv):
    srcof[mod]=os.path.basename(rel).replace('.js','')+'.js'
be={}
for root,_,fs in os.walk(BE+'/routes'):
    for fn in fs:
        if not fn.endswith('.js'): continue
        prefix=''
        for mod,pfx in mounts.items():
            if srcof.get(mod)==fn: prefix=pfx; break
        t=strip(open(os.path.join(root,fn),encoding='utf-8',errors='replace').read())
        for verb,rp in re.findall(r'router\.(get|post|put|patch|delete)\(\s*["\'`]([^"\'`]+)', t):
            rp = rp if rp.startswith('/') else '/'+rp
            be.setdefault(prefix+rp,set()).add(verb)
def norm(u):
    # A trailing `${...}` glued to the previous segment is an appended query
    # string (jobs.service.ts builds `/job/published${params}`), not a path param.
    u=re.sub(r'(?<=[^/])\$\{[^}]*\}$','',u)
    u=u.split('?')[0]
    u=re.sub(r'\$\{[^}]*\}',':p',u); u=re.sub(r':\w+',':p',u)
    return ('/'+u.strip('/')).rstrip('/') or '/'
be_n={}
for r,v in be.items(): be_n.setdefault(norm(r),set()).update(v)
unres=[c for c in calls if c[2].startswith('<?')]
srv=[c for c in calls if c[2].startswith('SERVER:')]
api=[c for c in calls if not c[2].startswith(('<?','SERVER:','http'))]
orph=[c for c in api if norm(c[2]) not in be_n]
print("FE calls %d | BE routes %d | resolved %d | unresolved %d | legacy-server %d | ORPHAN %d"%(len(calls),len(be),len(api),len(unres),len(srv),len(orph)))
for title,rows in (("UNRESOLVED",unres),("LEGACY environment.server",srv),("ORPHAN (no BE route)",orph)):
    print("\n=== %s ==="%title)
    for p,e,r in sorted(set(rows)): print("  %-58s %-55s -> %s"%(p.replace('src/app/',''),e,norm(r)))
# reverse: BE routes never called by FE
called={norm(c[2]) for c in api}
print("\n=== BE routes with NO FE caller (%d) ==="%len([r for r in be_n if r not in called]))
for r in sorted(be_n):
    if r not in called: print("  %-55s [%s]"%(r,','.join(sorted(be_n[r]))))
