import React, { Fragment } from 'react';
import { Container, Card, Divider, Typography } from '@material-ui/core';

import 'uppy/dist/uppy.min.css';
import Uppy from '@uppy/core';
// import Tus from '@uppy/tus';
import XHRUpload from '@uppy/xhr-upload';
import { DragDrop, Dashboard } from '@uppy/react';
import AwsS3 from '@uppy/aws-s3';

const ms = require('ms');

export default function FileUpload() {
  const uppy = new Uppy({
    meta: { type: 'avatar' },
    restrictions: { maxNumberOfFiles: 10, maxFileSize: 30000000000 },
    autoProceed: true,
  });

  // uppy.use(Tus, { endpoint: '/api/upload' });
  // uppy.use(XHRUpload, { endpoint: '/api/upload' });

  uppy.use(AwsS3, {
    getUploadParameters(file) {
      console.log(file);
      // Send a request to our PHP signing endpoint.
      return fetch('api/preSignS3URL', {
        method: 'post',
        // Send and receive JSON.
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: {
          filename: file.name,
          contentType: file.type,
        },
      })
        .then((response) => {
          // Parse the JSON response.
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log('PreSigned URL: ', data.preSignURL);
          // Return an object in the correct shape.
          return {
            method: data.method,
            url: data.preSignURL,
            fields: data.fields,
            // Provide content type header required by S3
            headers: {
              'Content-Type': file.type,
            },
          };
        });
    },
  });

  uppy.on('complete', (result) => {
    // window.alert('Test')
    console.log(result);
    // const url = result.successful[0].uploadURL;
    // store.dispatch({
    //   type: 'SET_USER_AVATAR_URL',
    //   payload: { url: url }
    // })
  });

  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Manage Patient Files</div>
          <Divider className="my-4" />

          <Container style={{ marginTop: '2em' }}>
            <Typography variant="h6">Uppy.js</Typography>
            <Dashboard
              uppy={uppy}
              metaFields={[{ id: 'name', name: 'Name', placeholder: 'File name' }]}
            />
          </Container>
        </Card>
      </Container>
    </Fragment>
  );
}