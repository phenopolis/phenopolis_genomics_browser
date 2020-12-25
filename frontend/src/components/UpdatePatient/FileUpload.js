import React, { Fragment, useEffect } from 'react';
import { Container, Card, Divider, Typography } from '@material-ui/core';
import axios from 'axios';

import 'uppy/dist/uppy.min.css';
import Uppy from '@uppy/core';
import { DragDrop, Dashboard, useUppy } from '@uppy/react';
import AwsS3 from '@uppy/aws-s3';

import { useDispatch, useSelector } from 'react-redux';
import { getFiles } from '../../redux/actions/files';

const ms = require('ms');

export default function FileUpload() {
  const dispatch = useDispatch();
  const patientID = 'PH0000001';

  useEffect(() => {
    // dispatch(getFiles(patientID));
  }, []);

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
  });

  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Manage Patient Files</div>
          <Divider className="my-4" />

          <Container style={{ marginTop: '2em' }}>
            <Dashboard id="phenopolis" uppy={uppy} width="100%" height="300px" />
          </Container>
        </Card>
      </Container>
    </Fragment>
  );
}
