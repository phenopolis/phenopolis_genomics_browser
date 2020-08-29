import React, { useState } from 'react';
import {
  CssBaseline,
  Paper,
  Container,
  Grid,
  Typography,
  Box,
  IconButton,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import TypeChip from '../Chip/TypeChip';
import { Collapse } from 'react-collapse';
import { SizeMe } from 'react-sizeme';

const MetaData = (props) => {
  const [expandNumber, setExpandNumber] = useState(3);
  const handleExpendAll = (n) => {
    setExpandNumber(n);
  };
  const metadata = props.metadata;

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="xl">
        <Typography component="div">
          <Box fontWeight="900" fontSize="h4.fontSize" mb={2}>
            {props.name}
          </Box>
        </Typography>

        <Paper className={'meta-paper'} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: '100' }}>
            <IconButton aria-label="expand">
              {expandNumber === 3 ? (
                <ExpandMoreIcon onClick={() => handleExpendAll(100)} />
              ) : (
                <ExpandLessIcon onClick={() => handleExpendAll(3)} />
              )}
            </IconButton>
          </div>
          <SizeMe>
            {({ size }) => (
              <div className={'meta-root'}>
                <Collapse isOpened={true}>
                  {metadata.colNames.slice(0, expandNumber).map((item, index) => {
                    return (
                      <Grid container spacing={3} key={index} className={'meta-blockgrid'}>
                        <Grid item xs={4} md={2} className={'meta-namegrid'}>
                          {item.name}
                        </Grid>

                        <Grid item xs={8} md={10}>
                          {typeof metadata.data[0][item.key] !== 'object' ? (
                            <span>
                              {(item.key === 'start') | (item.key === 'stop')
                                ? Number(metadata.data[0][item.key]).toLocaleString()
                                : metadata.data[0][item.key]}
                            </span>
                          ) : (
                            metadata.data[0][item.key].map((chip, m) => {
                              return chip.href ? (
                                <TypeChip
                                  label={chip.display}
                                  type="other"
                                  size="small"
                                  action="externalforward"
                                  popover={false}
                                  to={chip.href}
                                />
                              ) : (
                                <TypeChip
                                  label={chip.display}
                                  type={
                                    item.base_href
                                      ? item.base_href.replace(/[^a-zA-Z0-9_-]/g, '')
                                      : item.href.replace(/[^a-zA-Z0-9_-]/g, '')
                                  }
                                  size="small"
                                  action="forward"
                                  popover={true}
                                  to={
                                    chip.end_href
                                      ? (item.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                                      : item.base_href
                                      ? (item.base_href + '/' + chip.display).replace(/\/\//g, '/')
                                      : (item.href + '/' + chip.display).replace(/\/\//g, '/')
                                  }
                                />
                              );
                            })
                          )}
                        </Grid>
                      </Grid>
                    );
                  })}
                  {expandNumber === 3 ? (
                    <div className={'meta-blockFade'}>
                      <span
                        onClick={() => handleExpendAll(100)}
                        className={'meta-expandButton'}
                        style={{ width: size.width }}>
                        Expand More
                      </span>
                    </div>
                  ) : null}
                </Collapse>
              </div>
            )}
          </SizeMe>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default MetaData;
