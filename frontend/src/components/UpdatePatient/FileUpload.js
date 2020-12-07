import React, { Fragment } from 'react';
import { Container, Card, Divider } from '@material-ui/core';

const { DragDrop } = require('@uppy/drag-drop')
const Tus = require('@uppy/tus')
const Uppy = require('@uppy/core')

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


export default function FileUpload({ currentAvatar }) {


  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Manage Patient Files</div>
          <Divider className="my-4" />
          <div>
            <img src={currentAvatar} alt="Current Avatar" />
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
          </div>
        </Card>
      </Container>
    </Fragment>
  );
}
