import React from 'react';
import axios from 'axios';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button } from '@material-ui/core';
import { toast } from 'react-toastify';
import AllInboxIcon from '@material-ui/icons/AllInbox';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import BuildIcon from '@material-ui/icons/Build';
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@material-ui/core/TextField';

// Autenticacion con la API
axios.post('/api/authenticate', {
  password: 'admin',
  rememberMe: true,
  username: 'admin',
});

// Uso de estilos
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 650,
    },
    emptyProducts: {
      padding: '20px',
      fontSize: '0.875rem',
      textAlign: 'center',
    },
    buttons: {
      margin: theme.spacing(1),
    },
  })
);

export const Product = props => {
  const classes = useStyles();

  const [productList, setProductList] = React.useState([[], []]);

  const callApi = () => {
    // URL de las API
    const products = '/api/products';
    const buckets = '/api/product-buckets';

    // Se realiza la peticion GET
    const productsRequest = axios.get(products);
    const bucketsRequest = axios.get(buckets);

    axios.all([productsRequest, bucketsRequest]).then(
      axios.spread((...responses) => {
        const pReq = responses[0];
        const sReq = responses[1];

        // Se crea el array para la lista con los nombres de los productos
        const filteredProducts = [];
        sReq.data.map(bucketsData => {
          const prodId = bucketsData.id;
          pReq.data.map(productData => {
            if (prodId === productData.id) {
              filteredProducts.push(productData);
              // Se agregan los productos que coincidan con los datos filtrados en filteredbuckets a este nuevo array
            }
          });
        });

        const filteredData = [sReq.data, filteredProducts];

        setProductList(filteredData); // Se envia toda la informacion filtrada al estado del componente
      })
    );
  };

  React.useEffect(() => {
    callApi();
  }, [props.list]);

  const moveProduct = (productId, newState) => {
    axios
      .put('/api/buckets', {
        id: productId.toString(),
        state: newState,
      })
      .then(function () {
        toast.success('Producto movido 👌');
        callApi();
      })
      .catch(function () {
        toast.error('Error al mover el producto');
      });
  };

  const fetchBucket = index => {
    if (props.list === 'inChargeQuantity') {
      return productList[0][index].inChargeQuantity;
    } else if (props.list === 'availableToSellQuantity') {
      return productList[0][index].availableToSellQuantity;
    } else {
      return productList[0][index].brokenQuantity;
    }
  };

  return (
    <TableContainer component={Paper}>
      {productList[1].length === 0 ? (
        <div className={classes.emptyProducts}>No hay productos para mostrar</div>
      ) : (
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Producto</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Unidades en el balde</strong>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productList[1].map((product, index) => (
              <TableRow key={product.id}>
                <TableCell component="th" scope="row">
                  {product.id}
                </TableCell>
                <TableCell align="center">{product.name}</TableCell>
                <TableCell align="center">{fetchBucket(index)}</TableCell>
                <TableCell align="right">
                  {props.list === 'brokenQuantity' ? (
                    <>
                      <TextField
                        id="outlined-number"
                        label="Cantidad"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        className={classes.buttons}
                      />
                      Mover a
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<AllInboxIcon />}
                      >
                        Encargados
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<AssignmentTurnedInIcon />}
                      >
                        Disponibles
                      </Button>
                    </>
                  ) : props.list === 'availableToSellQuantity' ? (
                    <>
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<AllInboxIcon />}
                      >
                        Encargados
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<BuildIcon />}
                      >
                        Defectuosos
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<AssignmentTurnedInIcon />}
                      >
                        Disponibles
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => moveProduct(product.id, 'SHIPPED')}
                        startIcon={<BuildIcon />}
                      >
                        Defectuosos
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
