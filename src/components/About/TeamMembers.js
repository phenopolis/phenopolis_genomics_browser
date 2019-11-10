import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import clsx from 'clsx';
import { loadCSS } from 'fg-loadcss';

import { withStyles } from '@material-ui/core/styles';
import { withWidth, Grid, Box, Container, Typography, Card, Paper, CardContent, CardActions, Button, Avatar, Icon } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';

class TeamMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [
        {
          name: 'Nikolas',
          des: 'Some information about Niko, like background, graduated university, interests, hobby. eg.',
          icons: [
            {
              name: 'github',
              url: 'https://github.com/'
            },
            {
              name: 'twitter',
              url: 'https://twitter.com/'
            },
            {
              name: 'linkedin',
              url: 'https://linkedin.com/'
            }
          ]
        },
        {
          name: 'Ismail',
          des: 'Some information about Ismail, like background, graduated university, interests, hobby. eg.',
          icons: [
            {
              name: 'github',
              url: 'https://github.com/'
            },
            {
              name: 'twitter',
              url: 'https://twitter.com/'
            },
            {
              name: 'facebook',
              url: 'https://facebook.com/'
            },
            {
              name: 'linkedin',
              url: 'https://linkedin.com/'
            }
          ]
        },
        {
          name: 'Jing',
          des: 'Some information about Jing, like background, graduated university, interests, hobby. eg.',
          icons: [
            {
              name: 'github',
              url: 'https://github.com/'
            },
            {
              name: 'twitter',
              url: 'https://twitter.com/'
            },
            {
              name: 'facebook',
              url: 'https://linkedin.com/'
            }
          ]
        },
        {
          name: 'Tian',
          des: 'Some information about Tian, like background, graduated university, interests, hobby. eg.',
          icons: [
            {
              name: 'twitter',
              url: 'https://twitter.com/'
            },
            {
              name: 'linkedin',
              url: 'https://linkedin.com/'
            }
          ]
        }]
    };
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <div>
        {/* End hero unit */}
        <Grid container className={classes.root2}>
          <Grid container justify='center'>
            <Grid item xs={12} md={8} className={classes.gridpaper2}>
              <Paper elevation={0} className={classes.paper2}>
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
                    Our Mission
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='h6.fontSize'
                    m={1}
                    style={{ textAlign: 'left' }}
                  >
                    Phenopolis is an open-source web server providing an intuitive interface
                     to genetic and phenotypic databases. It integrates analysis tools such as
                     variant filtering and gene prioritization based on phenotype. The Phenopolis
                     platform will accelerate clinical diagnosis, gene discovery and encourage wider
                     adoption of the Human Phenotype Ontology in the study of rare genetic diseases.
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='subtitle.fontSize'
                    m={1}
                    style={{ textAlign: 'left' }}
                  >
                    (Above sentence is copied from phenopolis paper, I think maybe we can write a markdown document here. - Tian)
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Container className={classes.cardGrid} maxWidth="lg">
          <Grid container spacing={4}>
            {this.state.cards.map((card, index) => (
              <Grid item key={card} xs={12} sm={6} md={3} style={index !== 3 ? { borderRight: '1px solid gray' } : {}}>
                <Card elevation={0} className={classes.card}>
                  <Grid container justify="center" alignItems="center">
                    <Avatar src={require('../../assets/image/TmpAvatar.jpg')} className={classes.bigAvatar} />
                  </Grid>
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      <b>{card.name}</b>
                    </Typography>
                    <Typography style={{ textAlign: 'left' }} >
                      {card.des}
                    </Typography>
                  </CardContent>
                  <div className={classes.IconContent}>
                    {card.icons.map((icon, j) => {
                      return (
                        <a className={classes.a} href={icon.url}><Icon className={clsx(classes.iconHover, 'fab fa-' + icon.name)} /></a>
                      )
                    })
                    }
                  </div>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    );
  }
}

TeamMember.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired
};

const styles = theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  root2: {
    flexGrow: 1,
    backgroundColor: '#eeeeee',
    padding: '2em 0em 2em 0em'
  },
  gridpaper2: {
    textAlign: 'center'
  },
  paper2: {
    padding: '2em 1em 2em 1em',
    backgroundColor: '#eeeeee'
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa'
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
    textAlign: 'center'
  },
  IconContent: {
    paddingLeft: '1em',
    textAlign: 'left'
  },
  bigAvatar: {
    margin: 10,
    width: 200,
    height: 200
  },
  a: {
    textDecoration: 'none',
    margin: '5px',
    color: '#0279d3',
    '&:hover': {
      textShadow: '-0.06ex 0 white, 0.06ex 0 white',
    }
  }
});

export default compose(
  withStyles(styles),
  withWidth(),
  withTranslation()
)(TeamMember);
