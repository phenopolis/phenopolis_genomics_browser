import React from 'react';
import { Grid, Box, Container, CssBaseline, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitterSquare, faGithubSquare } from '@fortawesome/free-brands-svg-icons';

import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next';

function Copyright() {
  return (
    <Typography variant="body2" align="left">
      {'© '}
      2020 Phenopolis Limited. Registered company number 11541164.
    </Typography>
  );
}

export default function StickyFooter() {
  const location = useLocation();

  React.useEffect(() => {}, [location.pathname]);

  const { t } = useTranslation();

  return (
    <div className={'footer-root'}>
      <CssBaseline />
      {location.pathname === '/' ? (
        <Container component="main" className={'footer-main'} maxWidth="xl">
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography component="div">
                <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                  {t('Footer.About_Us')}
                </Box>
                <Box fontWeight="fontWeightRegular" fontSize="body2.fontSize" m={1}>
                  {i18next.t('Footer.Description')}
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography component="div">
                <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                  {i18next.t('Footer.Useful_Links')}
                </Box>
                <Box
                  fontWeight="fontWeightRegular"
                  fontSize="body2.fontSize"
                  m={1}
                  component={Link}
                  to="/publications"
                  className={'footer-link'}>
                  {i18next.t('Footer.Publications')}
                </Box>
                <Box fontWeight="fontWeightRegular" fontSize="body2.fontSize" m={1}>
                  <a href="https://github.com/phenopolis" className={'footer-link'}>
                    Github
                  </a>
                </Box>
                <Box fontWeight="fontWeightRegular" fontSize="body2.fontSize" m={1}>
                  <a href="mailto:info@phenopolis.org" className={'footer-link'}>
                    {' '}
                    {i18next.t('Contact')}{' '}
                  </a>
                </Box>
                <Box fontWeight="fontWeightRegular" fontSize="body2.fontSize" m={1}>
                  &nbsp;
                </Box>
              </Typography>
            </Grid>
          </Grid>
        </Container>
      ) : null}

      <footer className={'footer'}>
        <Container component="main" className={'footer-main'} maxWidth="xl">
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="body2" gutterBottom>
                <Trans i18nKey="Footer.Citation">
                  If you use Phenopolis, please cite us as:
                  <a href="https://doi.org/10.1093/bioinformatics/btx147" className={'footer-link'}>
                    Pontikos, N. et al. (2017). Phenopolis: an open platform for harmonization and
                    analysis of genetic and phenotypic data. Bioinformatics, 9, 7
                  </a>
                </Trans>
              </Typography>
              <Copyright />
            </Grid>
            <Grid item xs={12} md={2}>
              <Link
                className={'footer-link'}
                to="https://twitter.com/phenopolis"
                rel="noopener noreferrer"
                target="_blank"
                onClick={(event) => {
                  event.preventDefault();
                  window.open('https://twitter.com/phenopolis');
                }}>
                <FontAwesomeIcon icon={faTwitterSquare} className={'footer-iconHover'} size="2x" />
              </Link>
              <Link
                className={'footer-link'}
                to="https://github.com/phenopolis/"
                rel="noopener noreferrer"
                target="_blank"
                onClick={(event) => {
                  event.preventDefault();
                  window.open('https://github.com/phenopolis/');
                }}>
                <FontAwesomeIcon icon={faGithubSquare} className={'footer-iconHover'} size="2x" />
              </Link>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
}
