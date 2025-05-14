const { Pool } = require("pg");

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "CYL",
  password: "root",
  port: 5432,
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(
      "Conexión a la base de datos PostgreSQL establecida correctamente"
    );
    client.release();
    return true;
  } catch (error) {
    console.error("Error al conectar a la base de datos PostgreSQL:", error);
    return false;
  }
};

// Funciones para manipular la tabla de productos
const getProductos = async () => {
  try {
    const result = await pool.query("SELECT * FROM PRODUCTO ORDER BY ID");
    return result.rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

const getProductoById = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM PRODUCTO WHERE ID = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    throw error;
  }
};

const createProducto = async (nombre, camara) => {
  try {
    const result = await pool.query(
      "INSERT INTO PRODUCTO (NOMBRE, CAMARA) VALUES ($1, $2) RETURNING *",
      [nombre, camara]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

const updateProductoCamara = async (id, camara) => {
  try {
    const result = await pool.query(
      "UPDATE PRODUCTO SET CAMARA = $1 WHERE ID = $2 RETURNING *",
      [camara, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar cámara del producto:", error);
    throw error;
  }
};

const updateProducto = async (id, nombre, camara) => {
  try {
    const result = await pool.query(
      "UPDATE PRODUCTO SET NOMBRE = $1, CAMARA = $2 WHERE ID = $3 RETURNING *",
      [nombre, camara, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

const deleteProducto = async (id) => {
  try {
    const result = await pool.query(
      "DELETE FROM PRODUCTO WHERE ID = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};

// Función para manejar sincronización de datos
const sincronizarProductos = async (productos) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const producto of productos) {
      if (producto.id) {
        // Si tiene ID, actualizar
        await client.query(
          "UPDATE PRODUCTO SET NOMBRE = $1, CAMARA = $2 WHERE ID = $3",
          [producto.nombre, producto.camara, producto.id]
        );
      } else {
        // Si no tiene ID, insertar
        await client.query(
          "INSERT INTO PRODUCTO (NOMBRE, CAMARA) VALUES ($1, $2)",
          [producto.nombre, producto.camara]
        );
      }
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al sincronizar productos:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection,
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  updateProductoCamara,
  deleteProducto,
  sincronizarProductos,
};
