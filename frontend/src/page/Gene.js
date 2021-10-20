import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, Container } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useTranslation } from 'react-i18next';
import { getGene } from '../redux/actions/gene';

const MetaData = React.lazy(() => import('../components/MetaData'));
const VersatileTable = React.lazy(() => import('../components/BaseTable/VersatileTable'));

const Gene = (props) => {
  const { t, ready } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();

  const { geneInfo, loaded } = useSelector((state) => ({
    geneInfo: state.Gene.data[0],
    loaded: state.Gene.loaded,
  }));

  useEffect(() => {
    console.log(ready);
  }, [ready]);

  useEffect(() => {
    dispatch(getGene(props.match.params.geneId));
  }, [location]);

  useEffect(() => {
    dispatch(getGene(props.match.params.geneId));
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <div className="myPatients-container">
        {loaded ? (
          <MetaData
            metadata={geneInfo.metadata}
            name={
              geneInfo.metadata.data[0].gene_name + ' - ' + geneInfo.metadata.data[0].full_gene_name
            }
          />
        ) : (
          <Skeleton height={145} />
        )}

        {loaded ? (
          <Container maxWidth="xl">
            <VersatileTable
              title={t('Gene.Variants_Analysis')}
              subtitle={t('Gene.Variants Analysis_subtitle')}
              tableData={geneInfo.variants}
              genomePlot={true}
            />
          </Container>
        ) : (
          <>
            <div className="mt-4 mb-4" />
            <Skeleton variant="rect" height={150} />
            <div className="mt-4 mb-4" />
            <Skeleton variant="rect" height={450} />
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default Gene;
