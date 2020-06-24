import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import {
  withWidth,
  Grid,
  Box,
  Container,
  Typography,
  Card,
  Paper,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Avatar,
  Icon,
} from '@material-ui/core';

import StarIcon from '@material-ui/icons/Star';
import { withTranslation, Trans } from 'react-i18next';
import i18next from 'i18next';

class Pricing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <>
        <Container maxWidth="lg" component="main" className={classes.cardGrid}>
          <Grid container spacing={5} direction="row" justify="space-around" alignItems="center">
            <Grid item xs={12} md={7}>
              <Container maxWidth="sm" component="main" className={classes.heroContent}>
                <Typography
                  component="h2"
                  variant="h3"
                  align="center"
                  color="textPrimary"
                  gutterBottom>
                  <b>{t('Product.Exome_Analysis_Title')}</b>
                </Typography>

                <Typography variant="body1" align="left" color="textPrimary" component="p">
                  {t('Product.Exome_Analysis_Content')}
                  <ul>
                    <Trans i18nKey="Product.Exome_Analysis_Description">
                      <li> Mutation Detection. </li>
                      <li> Integrating between Phenotypes, mutation genes.</li>
                      <li> Deployment of Phenopolis system.</li>
                      <li> Long lasting service in 3 years.</li>
                    </Trans>
                  </ul>
                  {t('Product.Exome_Analysis_Close')}
                </Typography>
              </Container>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardHeader
                  title={t('Product.Exome_Price_Title')}
                  subheader={t('Product.Exome_Price_Subtitle')}
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  action={<StarIcon />}
                  className={classes.cardHeader}
                />
                <CardContent>
                  <div className={classes.cardPricing}>
                    <Typography component="h2" variant="h3" color="textPrimary">
                      £15
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      /{t('Product.Exome_Price_Unit')}
                    </Typography>
                  </div>
                  <ul align="center">
                    <Trans i18nKey="Product.Exome_Price_Feature">
                      <li>Feature 1</li>
                      <li>Feature 2</li>
                      <li>Feature 3</li>
                      <li>Feature 4</li>
                    </Trans>
                  </ul>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    href="mailto:info@phenopolis.org">
                    {t('Product.Exome_Price_Button')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </>
    );
  }
}

Pricing.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor: theme.palette.grey[200],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  a: {
    textDecoration: 'none',
  },
});

export default compose(withStyles(styles), withWidth(), withTranslation())(Pricing);
