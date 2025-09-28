# Use official Deno runtime as base image
FROM denoland/deno:2.3.7

# Set working directory
WORKDIR /app

# Install kubectl for cluster monitoring (as root)
RUN apt-get update && apt-get install -y curl && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/ && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./

# Set up Deno environment 
ENV DENO_DIR=/deno-dir
ENV NPM_CONFIG_PREFIX=/deno-dir/npm
ENV PATH="/deno-dir/npm/bin:$PATH"

# Create necessary directories and cache dependencies as root
RUN mkdir -p /deno-dir /deno-dir/npm /app/node_modules && \
    deno cache --reload deno.json

# Copy source files temporarily to cache all dependencies
COPY main.ts ./
COPY config/ ./config/
COPY utils/ ./utils/  
COPY services/ ./services/
COPY routes/ ./routes/
COPY islands/ ./islands/
COPY components/ ./components/
COPY types/ ./types/

# Cache all dependencies including transitive ones
RUN deno cache --reload main.ts

# Fix permissions for all npm binaries, especially esbuild-wasm
RUN find /deno-dir -name "esbuild*" -type f -exec chmod +x {} \; 2>/dev/null || true && \
    find /deno-dir -path "*/node_modules/.bin/*" -type f -exec chmod +x {} \; 2>/dev/null || true && \
    find /deno-dir -name "*.wasm" -type f -exec chmod 644 {} \; 2>/dev/null || true

# Copy source files with proper ownership
COPY --chown=deno:deno main.ts data.json ./
COPY --chown=deno:deno config/ ./config/
COPY --chown=deno:deno utils/ ./utils/  
COPY --chown=deno:deno services/ ./services/
COPY --chown=deno:deno routes/ ./routes/
COPY --chown=deno:deno islands/ ./islands/
COPY --chown=deno:deno components/ ./components/
COPY --chown=deno:deno types/ ./types/
COPY --chown=deno:deno assets/ ./assets/
COPY --chown=deno:deno static/ ./static/

# Create .deno directory structure that will be used at runtime
RUN mkdir -p /app/node_modules/.deno && \
    chown -R deno:deno /app /deno-dir && \
    chmod -R 755 /app /deno-dir

# For production with npm packages that need runtime binary setup, we need to stay as root
# This is the recommended approach for Deno + npm packages in containers
# USER deno

# Expose application port
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=2 \
  CMD deno eval "fetch('http://localhost:8000/health').then(r => r.ok ? Deno.exit(0) : Deno.exit(1)).catch(() => Deno.exit(1))"

# Start the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "--allow-sys", "--allow-run", "main.ts"]
