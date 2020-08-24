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

  // Estados del componente

  // Datos que trae la API
  const [productList, setProductList] = React.useState([[], []]);

  // Datos que ingresa el usuario
  const [inputData, setInputData] = React.useState({
    stockQuantity: 0,
  });

  const handleInputChange = event => {
    setInputData({
      ...inputData,
      stockQuantity: Number(event.target.value),
    });
  };

  // Funcion de utilidad para ordenar los array
  function sortByKey(array, key) {
    return array.sort(function (a, b) {
      const x = a[key];
      const y = b[key];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

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

        // Se crea un nuevo array para filtrar los baldes
        let filteredBuckets = [];
        sReq.data.map(bucketsData => {
          const prodId = bucketsData.id;
          pReq.data.map(productData => {
            if (prodId === productData.id) {
              // Si el ID del producto coincide con el ID del balde
              filteredBuckets.push(productData);
              // Se agregan los baldes que coincidan a este nuevo array
            }
          });
        });

        sReq.data = sortByKey(sReq.data, 'id');
        filteredBuckets = sortByKey(filteredBuckets, 'id');

        const filteredData = [sReq.data, filteredBuckets];

        setProductList(filteredData); // Se envia toda la informacion filtrada al estado del componente
      })
    );
  };

  // Se llama a la API una vez el componente este totalmente cargado
  React.useEffect(() => {
    callApi();
  }, [props.list]);

  const moveProduct = (productId, previousQuantity, previousBucket, newQuantity, newBucket) => {
    // Realizo comprobaciones para que los datos a procesar sean correctos
    if (newQuantity > previousQuantity) {
      toast.error('No se pueden mover mas unidades de las que hay en el balde');
    } else if (newQuantity < 0) {
      toast.error('La cantidad ingresada es incorrecta');
    } else if (newQuantity === 0) {
      toast.warn('Ingrese una cantidad');
    } else {
      // Se llama a la API para que devuelva el producto a mover
      axios
        .get('/api/product-buckets/' + productId.toString())
        .then(function (response) {
          // Se realizan las modificaciones de las unidades en stock
          response.data[previousBucket] = parseFloat(previousQuantity) - parseFloat(newQuantity);
          response.data[newBucket] += parseFloat(newQuantity);

          // Se llama a la API para efectuar los cambios
          axios
            .put('/api/product-buckets/', {
              id: productId,
              availableToSellQuantity: response.data.availableToSellQuantity,
              inChargeQuantity: response.data.inChargeQuantity,
              brokenQuantity: response.data.brokenQuantity,
              product: null,
            })
            .then(function () {
              toast.success(newQuantity + ' producto(s) movido 👌');
              callApi();
            })
            .catch(function () {
              toast.error('Error al mover el producto');
            });
        })
        .catch(function (error) {
          toast.error('Error al contactarse con la API - ' + error);
        });
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
                <TableCell align="center">{productList[0][index][props.list]} en stock</TableCell>
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
                        onChange={handleInputChange}
                      />
                      Mover a
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(
                            product.id,
                            productList[0][index][props.list],
                            props.list,
                            inputData.stockQuantity,
                            'inChargeQuantity'
                          )
                        }
                        startIcon={<AllInboxIcon />}
                      >
                        Encargados
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(
                            product.id,
                            productList[0][index][props.list],
                            props.list,
                            inputData.stockQuantity,
                            'availableToSellQuantity'
                          )
                        }
                        startIcon={<AssignmentTurnedInIcon />}
                      >
                        Disponibles
                      </Button>
                    </>
                  ) : props.list === 'availableToSellQuantity' ? (
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
                        onChange={handleInputChange}
                      />
                      Mover a
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(
                            product.id,
                            productList[0][index][props.list],
                            props.list,
                            inputData.stockQuantity,
                            'inChargeQuantity'
                          )
                        }
                        startIcon={<AllInboxIcon />}
                      >
                        Encargados
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(product.id, productList[0][index][props.list], props.list, inputData.stockQuantity, 'brokenQuantity')
                        }
                        startIcon={<BuildIcon />}
                      >
                        Defectuosos
                      </Button>
                    </>
                  ) : (
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
                        onChange={handleInputChange}
                      />
                      Mover a
                      <Button
                        variant="outlined"
                        className={classes.buttons}
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(
                            product.id,
                            productList[0][index][props.list],
                            props.list,
                            inputData.stockQuantity,
                            'availableToSellQuantity'
                          )
                        }
                        startIcon={<AssignmentTurnedInIcon />}
                      >
                        Disponibles
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() =>
                          moveProduct(product.id, productList[0][index][props.list], props.list, inputData.stockQuantity, 'brokenQuantity')
                        }
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
