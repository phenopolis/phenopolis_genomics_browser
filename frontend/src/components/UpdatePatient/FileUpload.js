import React, { Fragment } from 'react';
import { Container, Card, Divider, Typography } from '@material-ui/core';

import 'uppy/dist/uppy.min.css'
import Uppy from '@uppy/core';
// import Tus from '@uppy/tus';
import XHRUpload from '@uppy/xhr-upload'
import { DragDrop, Dashboard } from '@uppy/react';



export default function FileUpload() {

  const uppy = new Uppy({
    meta: { type: 'avatar' },
    restrictions: { maxNumberOfFiles: 1 },
    autoProceed: true,
  });
  
  // uppy.use(Tus, { endpoint: '/api/upload' });
  uppy.use(XHRUpload, { endpoint: '/api/upload' })
  
  uppy.on('complete', (result) => {
    // window.alert('Test')
    console.log(result)
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
            metaFields={[
              { id: 'name', name: 'Name', placeholder: 'File name' }
            ]}
          />
          </Container>
        </Card>
      </Container>
    </Fragment>
  );
}
