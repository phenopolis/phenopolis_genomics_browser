import React, { Fragment, useEffect } from 'react';
import { Container, Card, Divider, Typography, Grid, IconButton, Box } from '@material-ui/core';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload, faFileAlt, faTrashAlt } from '@fortawesome/pro-solid-svg-icons';

import 'uppy/dist/uppy.min.css';
import Uppy from '@uppy/core';
import { DragDrop, Dashboard, useUppy } from '@uppy/react';
import AwsS3 from '@uppy/aws-s3';

import { useDispatch, useSelector } from 'react-redux';
import { getFiles, deleteFile } from '../../redux/actions/files';

const ms = require('ms');

const getDateFormatted = (inputdate) => {
  var k = inputdate;
  var dt = new Date(k);
  var yr = dt.getYear() + 1900;
  var mn = dt.getMonth() + 1;
  var h = dt.getHours()
  var m = dt.getMinutes()
  return yr + "-" + mn + "-" + dt.getDate() + ' ' + h + ':' + m;
}

export default function FileUpload() {
  const dispatch = useDispatch();
  const patientID = 'PH0000001';

  useEffect(() => {
    dispatch(getFiles(patientID));
  }, []);

  const { files, fetchFileLoaded, deleteFileLoaded } = useSelector((state) => ({
    files: state.Files.files,
    fetchFileLoaded: state.Files.fetchFileLoaded,
    deleteFileLoaded: state.Files.deleteFileLoaded
  }));

  useEffect(() => {
    if(deleteFileLoaded){
      dispatch(getFiles(patientID));
    }
  }, [deleteFileLoaded]);

  const uppy = useUppy(() => {
    return new Uppy({
      id: 'phenopolis',
      autoProceed: true,
      restrictions: {
        allowedFileTypes: ['.vcf'],
      },
      allowMultipleUploads: true,
    })
      .use(AwsS3, {
        limit: 2,
        timeout: ms('1 minute'),
        getUploadParameters(file) {
          console.log(file.name);
          return axios
            .post('api/preSignS3URL', {
              prefix: patientID,
              filename: patientID + '_' + file.name,
              contentType: file.type,
            })
            .then((response) => {
              console.log(response);
              return response.data;
            })
            .then((data) => {
              return {
                url: data.url,
                method: data.method,
                fields: data.fields,
              };
            });
        },
      })
      .run();
  });

  uppy.on('complete', (result) => {
    console.log(result);
    dispatch(getFiles(patientID));
  });

  const handleDeleteFile = (fileKey) => {
    dispatch(deleteFile(fileKey));
  }

  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Uploaded Files</div>
          <Container style={{ marginTop: '2em' }}>
            {
              fetchFileLoaded ? (
                <Grid container spacing={4}>
                  {
                    files.Contents.map((item,index) => {
                      return(
                        <Grid item xs={6} md={4}>
                        <Card className="card-box text-black-50 bg-secondary mb-4 p-3">
                      <div className="d-flex align-items-center flex-column flex-sm-row">
                        <div>
                          <div className="bg-white border-primary border-2 text-center text-primary font-size-xl d-50 rounded-circle mb-3 mb-sm-0">
                            <FontAwesomeIcon icon={faFileAlt} />
                          </div>
                        </div>
                        <div className="pl-0 pl-sm-4">
                          <div className="d-block text-black d-sm-flex mb-1 pb-0" >
                            <span className="font-size-md font-weight-bold mb-0 pb-0">{item.Key.match(/_(.*)/)[1]}</span>
                          </div>
                          <p className="text-black-50 mb-0 mt-0 font-size-xs">
                            {getDateFormatted(item.LastModified)}
                          </p>
                          <p className="text-black-50 mb-0 mt-0 font-size-xs">
                            {Math.round(item.Size/(1024))}K
                          </p>
                        </div>
                      </div>
                          <div className="d-flex justify-content-end">
                          <IconButton color="default" aria-label="" component="span">
                          <FontAwesomeIcon icon={faCloudDownload} style={{fontSize: 15}} />
                          </IconButton>
                          <IconButton color="secondary" aria-label="" component="span" onClick={() => handleDeleteFile(item.Key)}>
                            <FontAwesomeIcon icon={faTrashAlt} style={{fontSize: 15}} />
                            </IconButton>
                              </div>
                        </Card>
                      </Grid>
                      )
                    })
                  }

              </Grid>
              ) : (
                <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="10vh">
                  <Typography variant="h6" gutterBottom style={{ color: 'grey' }}>
                    This patient have no VCF file uploaded yet.
                  </Typography>
                </Box>
              </Container>
              )
            }

              </Container>
          <Divider className="my-4" />
          <div className="font-size-lg font-weight-bold">Upload VCF File</div>
          <Container style={{ marginTop: '2em' }}>
            <Dashboard id="phenopolis" uppy={uppy} width="100%" height="300px" />
          </Container>
        </Card>
      </Container>
    </Fragment>
  );
}
