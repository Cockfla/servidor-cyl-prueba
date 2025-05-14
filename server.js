const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "API de productos funcionando correctamente" });
});

// Probar conexión a la base de datos
app.get("/api/test-connection", async (req, res) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({
        status: "success",
        message: "Conexión a la base de datos establecida correctamente",
      });
    } else {
      res
        .status(500)
        .json({
          status: "error",
          message: "No se pudo conectar a la base de datos",
        });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await db.getProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener un producto por ID
app.get("/api/productos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const producto = await db.getProductoById(id);

    if (producto) {
      res.json(producto);
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Crear un nuevo producto
app.post("/api/productos", async (req, res) => {
  try {
    const { nombre, camara } = req.body;

    if (!nombre || !camara) {
      return res
        .status(400)
        .json({ status: "error", message: "Se requiere nombre y cámara" });
    }

    const newProducto = await db.createProducto(nombre, camara);
    res.status(201).json(newProducto);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Actualizar un producto completo
app.put("/api/productos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, camara } = req.body;

    if (!nombre || !camara) {
      return res
        .status(400)
        .json({ status: "error", message: "Se requiere nombre y cámara" });
    }

    const updatedProducto = await db.updateProducto(id, nombre, camara);

    if (updatedProducto) {
      res.json(updatedProducto);
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Actualizar solo la cámara de un producto (ruta específica según requerimiento)
app.patch("/api/productos/:id/camara", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { camara } = req.body;

    if (!camara) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Se requiere el valor de la cámara",
        });
    }

    const updatedProducto = await db.updateProductoCamara(id, camara);

    if (updatedProducto) {
      res.json(updatedProducto);
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un producto
app.delete("/api/productos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedProducto = await db.deleteProducto(id);

    if (deletedProducto) {
      res.json({
        status: "success",
        message: "Producto eliminado correctamente",
        producto: deletedProducto,
      });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Endpoint para sincronización de datos de la aplicación móvil
app.post("/api/sincronizar", async (req, res) => {
  try {
    const { productos } = req.body;

    if (!productos || !Array.isArray(productos)) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Se requiere un array de productos",
        });
    }

    await db.sincronizarProductos(productos);
    const productosActualizados = await db.getProductos();

    res.json({
      status: "success",
      message: "Sincronización completada correctamente",
      productos: productosActualizados,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
