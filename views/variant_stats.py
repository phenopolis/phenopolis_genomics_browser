
# AJAX
# fetches variant record from db
@app.route('/fetch_variant',methods=['GET','POST'])
def fetch_variant():
    if request.method=='POST':
        variants=request.form['variants'].strip().split(',')
    else:
        variants=request.args.get('variants').strip().split(',')
    db=get_db()
    req_len=len(variants)
    variant_ids=map(lambda x: x.replace('_','-'),variants)
    variants=[v for v in db.variants.find({'variant_id':{'$in':variant_ids}}, projection={'_id': False})]
    ans_len=len(variants)
    print(req_len==ans_len)
    res=jsonify(result=variants)
    return res


# AJAX
# fetches information from db
@app.route('/variant_count',methods=['GET','POST'])
def variant_count():
    if request.method=='POST':
        external_id=request.form['external_id'].strip()
    else:
        external_id=request.args.get('external_id').strip()
    #rsession=get_R_session()
    #res=jsonify(result={'variant_count':rsession.eval('sum(as.logical(variants[["%s"]]))' % external_id) , 'external_id':external_id})
    #return res

# AJAX
# fetches information from db
@app.route('/private_variant_count',methods=['GET','POST'])
def private_variant_count():
    if request.method=='POST':
        external_id=request.form['external_id'].strip()
    else:
        external_id=request.args.get('external_id').strip()
    db=get_db(app.config['DB_NAME_PATIENTS'])
    p=db.patients.find_one({'external_id':external_id})
    if 'PRIVATE_MUT' not in p: private_variant_count=0
    else: private_variant_count=len(p['PRIVATE_MUT'])
    res=jsonify(result={'variant_count': private_variant_count, 'external_id':external_id})
    return res


