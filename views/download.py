
'''
serve the Vincent annotated csv files
'''
@app.route('/download/send_csv', methods=['GET','POST'])
@requires_auth
def download_csv():
    p_id = request.args.get('p_id')
    if not lookup_patient(session['user'],p_id): return 'Sorry you are not permitted to see this patient, please get in touch with us to access this information.'
    folder = request.args.get('folder')
    path = DROPBOX
    csv_file = os.path.join(path,folder, p_id + '.csv')
    filename = folder+'_'+p_id+'.csv'
    if not os.path.isfile(csv_file):
        return 'Oops, file not found!'
    return send_file(csv_file, mimetype='text/csv', attachment_filename=filename, as_attachment=True)

@app.route('/download', methods=['GET','POST'])
@requires_auth
def download():
    p_id = request.args.get('p_id')
    if not lookup_patient(session['user'],p_id): return 'Sorry you are not permitted to see this patient, please get in touch with us to access this information.'
    filetype = request.args.get('filetype')
    index = request.args.get('index')
    path=app.config[str(filetype)]
    print(path)
    if p_id:
        filename=os.path.join(path, p_id)
    else:
        filename=os.path.join(path)
    if filetype=='VCF_DIR':
        if index=='true':
            filename=os.path.join(path, p_id,'all.vcf.gz.tbi')
            attachment_filename=p_id+'.vcf.gz.tbi'
        else:
            filename=os.path.join(path, p_id,'all.vcf.gz')
            attachment_filename=p_id+'.vcf.gz'
    elif filetype=='BAM_DIR':
        if index=='true':
            filename=os.path.join(path, p_id+'_sorted_unique.bam.bai')
            attachment_filename=p_id+'.bam.bai'
        else:
            filename=os.path.join(path, p_id+'_sorted_unique.bam')
            attachment_filename=p_id+'.bam'
    elif filetype=='IRDC_VARIANT_FILES':
        filename=os.path.join(path)
        attachment_filename='IRDC_VARIANTS.zip'
    elif filetype=='IRDC_CNV_FILES':
        filename=os.path.join(path)
        attachment_filename='IRDC_CNV.zip'
    return send_file(filename, mimetype='*/*', attachment_filename=attachment_filename, as_attachment=True)


