import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import { withWidth, Grid, Box, Container, Typography, Card, Paper, CardContent, CardHeader, CardActions, Button, Avatar, Icon } from '@material-ui/core';

import StarIcon from '@material-ui/icons/Star';
import { withTranslation, Trans } from 'react-i18next';

class Pricing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tier: {
        title: 'Exome Analysis',
        subheader: 'Most popular',
        price: '15',
        description: [
          'Feature 1',
          'Feature 2',
          'Feature 3',
          'Feature 4',
        ],
        buttonText: 'Contact Us',
        buttonVariant: 'contained'
      }
    }
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <>
        <Container maxWidth="lg" component="main" className={classes.cardGrid}>
          <Grid container spacing={5} direction="row" justify="space-around" alignItems="center">
            <Grid item xs={7}>
              <Container maxWidth="sm" component="main" className={classes.heroContent}>
                <Typography component="h2" variant="h3" align="center" color="textPrimary" gutterBottom>
                  <b>Exome Analysis</b>
                </Typography>
                <Typography variant="body1" align="left" color="textPrimary" component="p">
                  We help you to conduct whole exome analysis, and organize data into phenopolis for all your lab members or colaborators.
                  Our service contains:
                  <ul>
                    <li> Mutation Detection. </li>
                    <li> Integrating between Phenotypes, mutation genes.</li>
                    <li> Deployment of Phenopolis system.</li>
                    <li> Long lasting service in 3 years.</li>
                  </ul>
                  Contact us for more information.
                </Typography>
              </Container>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardHeader
                  title={this.state.tier.title}
                  subheader={this.state.tier.subheader}
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  action={<StarIcon />}
                  className={classes.cardHeader}
                />
                <CardContent>
                  <div className={classes.cardPricing}>
                    <Typography component="h2" variant="h3" color="textPrimary">
                      £{this.state.tier.price}
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      /exome
                  </Typography>
                  </div>
                  <ul>
                    {this.state.tier.description.map(line => (
                      <Typography component="li" variant="subtitle1" align="center" key={line}>
                        {line}
                      </Typography>
                    ))}
                  </ul>
                </CardContent>
                <CardActions>
                    <Button fullWidth variant={this.state.tier.buttonVariant} color="primary" href='mailto:info@phenopolis.org'>
                      {this.state.tier.buttonText}
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
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired
};

const styles = theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor: theme.palette.grey[200]
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  a: {
    textDecoration: 'none'
  }
});

export default compose(
  withStyles(styles),
  withWidth(),
  withTranslation()
)(Pricing);
