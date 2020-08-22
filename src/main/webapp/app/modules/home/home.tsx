import './home.scss';
import React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';

// Importo componente Products al componente Home del sitio
import Products from '../products/products'

export type IHomeProp = StateProps;

export const Home = (props: IHomeProp) => {
  const { account } = props;

  return (
    <div id="home">
        <h2>
          Bienvenido a Merlion Techs
        </h2>
        {account && account.login ? (
          <div>
          <Products/>
          </div>
        ) : (
          <div>
            <Alert color="warning">
              Inicia sesion para continuar.
            </Alert>
          </div>
        )}
    </div>
  );
};

const mapStateToProps = storeState => ({
  account: storeState.authentication.account,
  isAuthenticated: storeState.authentication.isAuthenticated,
});

type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(Home);
