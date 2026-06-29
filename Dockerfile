# Usar una imagen oficial de Python slim (Debian 12 Bookworm)
FROM python:3.10-slim

# Instalar herramientas básicas necesarias y dependencias unixODBC
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    apt-transport-https \
    unixodbc-dev \
    unixodbc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Descargar la clave GPG de Microsoft de forma segura y convertirla a formato binario
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg

# Agregar el repositorio de Microsoft SQL Server para Debian 12 (Bookworm) usando la clave firmada
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list

# Actualizar repositorios e instalar msodbcsql17 de forma no interactiva
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar dependencias de Python e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto del servidor Flask
EXPOSE 5000

# Comando para iniciar la aplicación mediante Gunicorn
CMD ["gunicorn", "--workers=3", "--bind=0.0.0.0:5000", "app:app"]
