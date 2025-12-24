FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY dist ./
COPY scripts/vault.js ./vault.js

ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/server/libquery_engine-linux-musl-openssl-3.0.x.so.node"
ENV VAULT_PASS="bWeiWDslMrj"

EXPOSE 3000
CMD ["sh", "-c", "node vault.js decrypt && node server/index.js"]
