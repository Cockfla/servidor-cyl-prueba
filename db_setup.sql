-- Crear la tabla PRODUCTO si no existe
CREATE TABLE IF NOT EXISTS PRODUCTO (
    ID SERIAL PRIMARY KEY,
    NOMBRE VARCHAR(255) NOT NULL,
    CAMARA VARCHAR(255) NOT NULL
);

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO PRODUCTO (NOMBRE, CAMARA) VALUES
    ('Producto 1', 'Cámara A'),
    ('Producto 2', 'Cámara B'),
    ('Producto 3', 'Cámara C')
ON CONFLICT (ID) DO NOTHING;