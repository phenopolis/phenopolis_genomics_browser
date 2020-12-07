import React, { Fragment } from 'react';
import { Container, Card, Divider, Typography } from '@material-ui/core';

import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'

import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { DragDrop } from '@uppy/react'


const uppy = new Uppy({
  meta: { type: 'avatar' },
  restrictions: { maxNumberOfFiles: 1 },
  autoProceed: true
})

uppy.use(Tus, { endpoint: '/upload' })

uppy.on('complete', (result) => {
  const url = result.successful[0].uploadURL
  // store.dispatch({
  //   type: 'SET_USER_AVATAR_URL',
  //   payload: { url: url }
  // })
})


export default function FileUpload() {

  const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  }
  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Manage Patient Files</div>
          <Divider className="my-4" />
          <Container>
            <Typography variant="h6">
              react-drop-zone
            </Typography>
            <Dropzone
              getUploadParams={getUploadParams}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              accept="image/*,audio/*,video/*"
            />
          </Container>

          <Container style={{ marginTop: '2em' }}>
            <Typography variant="h6">
              Uppy.js
            </Typography>
            <DragDrop
              uppy={uppy}
              locale={{
                strings: {
                  // Text to show on the droppable area.
                  // `%{browse}` is replaced with a link that opens the system file selection dialog.
                  dropHereOr: 'Drop here or %{browse}',
                  // Used as the label for the link that opens the system file selection dialog.
                  browse: 'browse'
                }
              }}
            />
          </Container>
        </Card>
      </Container>
    </Fragment>
  );
}
