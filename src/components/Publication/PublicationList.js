import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import { withWidth, Container, Box, Typography } from '@material-ui/core';

import { withTranslation } from 'react-i18next';

import paperlist from '../../assets/js/paperlist';

class PublicationList extends React.Component {
  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;
    const pl = paperlist;

    return (
      <div className={classes.root}>
        <Container maxWidth="md">
          {pl.map((section, sid) => {
            return (
              <Typography component="div" key={sid}>
                <Box fontWeight="fontWeightBold" fontSize="h4.fontSize" m={1}>
                  {t('Publication.' + section.title)}
                </Box>
                {section.data.map((subsection, ssid) => {
                  return (
                    <div key={ssid}>
                      <Box fontWeight="fontWeightBold" fontSize="h5.fontSize" m={1}>
                        {t('Publication.' + subsection.subtitle)}
                      </Box>
                      {subsection.publications.map((paper, index) => {
                        return (
                          <Box
                            className={classes.paperbox}
                            key={index}
                            fontSize="subtitle1.fontSize"
                            m={1}>
                            {index + 1} .{' '}
                            <a className={classes.paperlink} href={paper.link}>
                              {paper.title}
                            </a>
                            {paper.display}
                          </Box>
                        );
                      })}
                    </div>
                  );
                })}
              </Typography>
            );
          })}
        </Container>
      </div>
    );
  }
}

PublicationList.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  root: {
    padding: '4em 0em 4em 0em',
    backgroundColor: '#eeeeee',
  },
  paper: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  paperlink: {
    textDecoration: 'none',
    color: '#2E84CF',
  },
  paperbox: {
    textIndent: '-1.35em',
    paddingLeft: '4em',
  },
});

export default compose(withStyles(styles), withWidth(), withTranslation())(PublicationList);
