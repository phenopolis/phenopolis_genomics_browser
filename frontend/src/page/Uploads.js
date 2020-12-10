import { Container } from '@material-ui/core';
import React, { useEffect } from 'react';

import FileUpload from '../components/UpdatePatient/FileUpload'


const Uploads = (props) => {

  return (
    <Container style={{ marginTop: '2em', minHeight: '80vh' }}>
      <FileUpload />
    </Container>
  );
};

export default Uploads;
