import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Grid, IconButton, Button, Tooltip } from '@material-ui/core';

import svgImage3 from '../assets/image/404.svg';

export default function LivePreviewExample() {
  return (
    <Fragment>
      <div className="app-wrapper bg-white">
        <div className="app-main">
          <div className="app-content p-0">
            <div className="app-inner-content-layout--main">
              <div className="flex-grow-1 w-100 d-flex align-items-center">
                <div className="bg-composed-wrapper--content">
                  <div className="hero-wrapper bg-composed-wrapper min-vh-100">
                    <div className="flex-grow-1 w-100 d-flex align-items-center">
                      <Grid
                        item
                        lg={6}
                        md={9}
                        className="px-4 px-lg-0 mx-auto text-center text-black">
                        <img
                          src={svgImage3}
                          className="w-50 mx-auto d-block my-5 img-fluid"
                          alt="..."
                        />

                        <h3 className="font-size-xxl line-height-sm font-weight-light d-block px-3 mb-3 text-black-50">
                          The page you were looking for doesn't exist.
                        </h3>
                        <Link style={{ textDecoration: 'none' }} to="/">
                          <Button
                            disableElevation
                            variant="contained"
                            className="ml-3"
                            size="large"
                            color="primary">
                            <span className="btn-wrapper--label">Home</span>
                          </Button>
                        </Link>
                      </Grid>
                    </div>
                    <div className="hero-footer py-4">
                      <Tooltip arrow title="Facebook">
                        <IconButton
                          color="primary"
                          size="medium"
                          variant="outlined"
                          className="text-facebook">
                          <FontAwesomeIcon icon={['fab', 'facebook']} className="font-size-md" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Twitter">
                        <IconButton
                          color="primary"
                          size="medium"
                          variant="outlined"
                          className="text-twitter">
                          <FontAwesomeIcon icon={['fab', 'twitter']} className="font-size-md" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Google">
                        <IconButton
                          color="primary"
                          size="medium"
                          variant="outlined"
                          className="text-google">
                          <FontAwesomeIcon icon={['fab', 'google']} className="font-size-md" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Instagram">
                        <IconButton
                          color="primary"
                          size="medium"
                          variant="outlined"
                          className="text-instagram">
                          <FontAwesomeIcon icon={['fab', 'instagram']} className="font-size-md" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
