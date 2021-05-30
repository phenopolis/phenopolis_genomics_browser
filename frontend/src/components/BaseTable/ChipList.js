import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import TypeChip from '../Chip/TypeChip';
import { Chip } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/pro-solid-svg-icons';

const useStyles = makeStyles((theme) => ({}));

const ChipList = (props) => {
  const classes = useStyles();
  const [expand, setExpand] = useState(false);

  const { compact } = useSelector((state) => ({
    compact: state.TableStatus.compact,
  }));

  // useEffect(() => {
  //   console.log(compact)
  // }, [compact]);

  const handleExpandRaw = () => {
    setExpand(!expand);
  };

  if (compact && !expand) {
    return (
      <span>
        {typeof props.chips === 'object' && props.chips.length >= 1 ? (
          <>
            {typeof props.chips[0] === 'object' ? (
              <TypeChip
                label={props.chips[0].display}
                type={props.colName.base_href.replace(/[^a-zA-Z0-9_-]/g, '')}
                size="small"
                action="forward"
                popover={true}
                to={
                  props.chips[0].end_href
                    ? (props.colName.base_href + '/' + props.chips[0].end_href).replace(
                        /\/\//g,
                        '/'
                      )
                    : (props.colName.base_href + '/' + props.chips[0].display).replace(/\/\//g, '/')
                }
              />
            ) : (
              <Chip
                variant="outlined"
                size="small"
                label={props.chips[0]}
                style={{ margin: '3px' }}
              />
            )}
            {props.chips.length >= 2 && (
              <Chip
                label={props.chips.length - 1 + '+'}
                icon={<FontAwesomeIcon icon={faEye} style={{ fontSize: '15px' }} />}
                size="small"
                color="primary"
                onClick={handleExpandRaw}
              />
            )}
          </>
        ) : (
          <>{props.chips}</>
        )}
      </span>
    );
  } else {
    return (
      <span>
        {typeof props.chips === 'object' ? (
          <>
            {props.chips.map((chip, index) => {
              return (
                <>
                  {typeof chip === 'object' ? (
                    <TypeChip
                      key={index}
                      label={chip.display}
                      type={props.colName.base_href.replace(/[^a-zA-Z0-9_-]/g, '')}
                      size="small"
                      action="forward"
                      popover={true}
                      to={
                        chip.end_href
                          ? (props.colName.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                          : (props.colName.base_href + '/' + chip.display).replace(/\/\//g, '/')
                      }
                    />
                  ) : (
                    <Chip
                      key={index}
                      variant="outlined"
                      size="small"
                      label={chip}
                      style={{ margin: '3px' }}
                    />
                  )}
                </>
              );
            })}
            {compact && props.chips.length >= 2 && (
              <Chip
                label={props.chips.length - 1}
                // variant="outlined"
                icon={<FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: '15px' }} />}
                size="small"
                color="primary"
                onClick={handleExpandRaw}
              />
            )}
          </>
        ) : (
          <>{props.chips}</>
        )}
      </span>
    );
  }
};

export default ChipList;
