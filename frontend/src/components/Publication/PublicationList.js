import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography } from '@material-ui/core';
import paperlist from '../../assets/js/paperlist';

const PublicationList = () => {
  const { t } = useTranslation();
  const publications = paperlist;

  return (
    <div className={'publication-root'}>
      <Container maxWidth="md">
        {publications.map((section, sid) => {
          return (
            <Typography component="div" key={sid}>
              <Box fontWeight="900" fontSize="h4.fontSize" m={1}>
                {t('Publication.' + section.title)}
              </Box>
              {section.data.map((subsection, ssid) => {
                return (
                  <div key={ssid}>
                    <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                      {t('Publication.' + subsection.subtitle)}
                    </Box>
                    {subsection.publications.map((paper, index) => {
                      return (
                        <Box
                          className={'publication-paperbox'}
                          key={index}
                          fontSize="subtitle1.fontSize"
                          m={1}>
                          {index + 1} .{' '}
                          <a className={'publication-paperlink'} href={paper.link}>
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
};

PublicationList.propTypes = {
  // width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default PublicationList;
